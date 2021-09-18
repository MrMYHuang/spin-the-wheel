import React from 'react';
import { IonContent, IonHeader, IonPage, IonToolbar, withIonLifeCycle, IonToast, IonTitle, IonButton, IonRange, IonIcon } from '@ionic/react';
import { RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import * as d3 from 'd3';

import { Settings } from '../models/Settings';
import { TmpSettings } from '../models/TmpSettings';
import { SelectionItem } from '../models/SelectionItem';
import DecisionsModal from '../components/DecisionsModal';
import { shareSocial } from 'ionicons/icons';

const padding = { top: 20, right: 20, bottom: 20, left: 20 };
const spins = 3;
const degrees = spins * 360;

// PURE FUNCTIONS
function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

interface Props {
  dispatch: Function;
  tmpSettings: TmpSettings;
  settings: Settings;
}

interface PageProps extends Props, RouteComponentProps<{
  path: string;
  tab: string;
}> { }

interface State {
  selectedItem: string;
  showDecisonsModal: boolean;
  showToast: boolean;
  toastMessage: string;
}

class _WheelPage extends React.Component<PageProps, State> {

  constructor(props: any) {
    super(props);
    this.state = {
      selectedItem: '',
      showDecisonsModal: false,
      showToast: false,
      toastMessage: '',
    }
    window.addEventListener('resize', () => {
      this.renderWheel();
    });
  }

  get decision() {
    const decisions = this.props.settings.decisions;
    if (decisions.length === 0) {
      return undefined;
    }
    return decisions[this.props.settings.selectedDecision]
  }

  ionViewWillEnter() {
    //console.log(`${this.props.match.url} will enter`);
    this.renderWheel();
  }

  componentDidMount() {
  }

  wheel: d3.Selection<SVGGElement, null, d3.BaseType, unknown> | undefined;
  renderWheel() {
    if (this.decision == null) {
      return;
    }

    d3.select('#chart').selectChild('svg').remove();

    const chartBoundingClientRect = document.querySelector('#chart')!.getBoundingClientRect();
    const svgWidth = chartBoundingClientRect.width;
    const svgHeight = chartBoundingClientRect.height;
    const width = svgWidth - padding.left - padding.right;
    const height = svgHeight - padding.top - padding.bottom;
    const radius = Math.min(width, height) / 2;
    const color = d3.scaleOrdinal(["#e5dff6", "#e5f6df", "#dfe5f6", "#ebd4f3", "#f6f0df"]);

    let svg: d3.Selection<d3.BaseType, null, d3.BaseType, unknown> = d3.select('#chart')
      .selectAll('svg').data([null])
      .join('svg')
      .attr('width', svgWidth)
      .attr('height', svgHeight);

    svg.selectChildren().remove();

    const container = svg.append('g')
      .attr('class', 'chartcontainer')
      .attr('transform', `translate(${width / 2 + padding.left},${height / 2 + padding.top})`);

    this.wheel = container.append('g')
      .attr('class', 'wheel');

    const pie = d3.pie<SelectionItem>().sort(null).value(function (d) { return 1; });

    const arc = d3.arc<d3.PieArcDatum<SelectionItem>>()
      .innerRadius(0)
      .outerRadius(radius);

    const arcs = this.wheel!.selectAll('g.slice')
      .data(pie(this.decision!.selections))
      .enter()
      .append('g')
      .attr('class', 'slice');

    arcs.append('path')
      .attr('fill', function (d, i: number) { return color(i + ''); })
      .attr('d', function (d: d3.PieArcDatum<SelectionItem>) { return arc(d); });

    arcs.append("text").attr("transform", function (d: d3.PieArcDatum<SelectionItem>) {
      //d.innerRadius = 0;
      const outerRadius = radius;
      const angle = (d.startAngle + d.endAngle) / 2;
      return `rotate(${(angle * 180 / Math.PI - 90)})translate(${outerRadius - 10})`;
    })
      .attr("text-anchor", "end")
      .text((d: any, i: number) => {
        //console.log(this.state.data[i].ticker);
        return this.decision!.selections[i].title;
      })
      .style('font-size', this.decision!.fontSize);

    // arrow
    svg.append('g')
      .attr('class', 'arrow')
      .attr('transform', `translate(${(width + padding.left + padding.right) / 2 - 15}, 12)`)
      .append('path')
      .attr('d', `M0 0 H30 L 15 ${Math.sqrt(3) / 2 * 30}Z`)
      .style('fill', '#000809');
  }

  spin() {
    const piedegree = 360 / this.decision!.selections.length;
    const randomAssetIndex = getRandomInt(0, this.decision!.selections.length);
    const randomPieMovement = getRandomInt(1, piedegree);

    const rotation = (this.decision!.selections.length - randomAssetIndex) * piedegree - randomPieMovement + degrees;

    function rotTween() {
      let i = d3.interpolate(0, rotation);
      return function (t: number) {
        return `rotate(${i(t)})`;
      };
    }

    this.wheel?.transition()
      .duration(3000)
      .attrTween('transform', rotTween)
      .ease(d3.easeCircleOut)
      .on('end', () => {

        const result = this.decision!.selections[randomAssetIndex].title;
        //console.log(result);
        this.setState({ selectedItem: result });
      });
  }

  render() {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle className='uiFont'>幸運輪盤</IonTitle>

            <IonButton fill="clear" slot='end' onClick={e => {
              const thisDecision = `title=${encodeURIComponent(this.decision!.title)}&${this.decision!.selections.map(v => `sel=${encodeURIComponent(v.title)}`).join('&')}`;
              this.props.dispatch({
                type: "TMP_SET_KEY_VAL",
                key: 'shareTextModal',
                val: {
                  show: true,
                  text: `${window.location.origin}${window.location.pathname}?${thisDecision}`,
                },
              });
            }}>
              <IonIcon icon={shareSocial} slot='icon-only' />
            </IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div className='contentCenter'>
            <div style={{ flex: '0 0 auto', fontSize: this.decision?.fontSize || 24 }}>
              {this.decision?.title}
              <span style={{ color: 'red' }}>{this.state.selectedItem}</span>
            </div>

            <div id="chart">
            </div>

            <div style={{ display: 'flex', flexDirection: 'row', verticalAlign: 'middle', width: 'calc(100% - 40px)' }}>
              <span className='uiFont' style={{ marginTop: 'auto', marginBottom: 'auto' }}>文字大小</span>
              <div style={{ marginTop: 'auto', marginBottom: 'auto', flex: '1 1 auto' }}>
                <IonRange min={12} max={128} pin={true} snaps={true} value={this.decision?.fontSize || 24} onIonChange={async e => {
                  let decisions = this.props.settings.decisions;
                  let decision = this.decision!;
                  decision.fontSize = +e.detail.value;
                  const i = decisions.findIndex(d => d.uuid === decision.uuid);
                  decisions[i] = decision;
                  await this.props.dispatch({
                    type: "UPDATE_DECISIONS",
                    decisions: decisions,
                  });
                  this.renderWheel();
                }} />
              </div>
            </div>

            <div className='buttonsRow'>
              <IonButton fill='outline' shape='round' size='large' className='uiFont' onClick={e => {
                this.setState({ showDecisonsModal: true });
              }}>選擇</IonButton>
              <IonButton fill='outline' shape='round' size='large' className='uiFont' onClick={e => {
                this.spin();
              }}>轉動</IonButton>
            </div>

          </div>

          <DecisionsModal
            {...{
              showModal: this.state.showDecisonsModal,
              finish: () => {
                this.setState({ showDecisonsModal: false, selectedItem: '' });
                this.renderWheel();
              },
              ...this.props
            }}
          />

          <IonToast
            cssClass='uiFont'
            isOpen={this.state.showToast}
            onDidDismiss={() => this.setState({ showToast: false })}
            message={this.state.toastMessage}
            duration={2000}
          />
        </IonContent>
      </IonPage>
    );
  }
};

const WheelPage = withIonLifeCycle(_WheelPage);

const mapStateToProps = (state: any /*, ownProps*/) => {
  return {
    isLoadingData: state.tmpSettings.isLoadingData,
    tmpSettings: state.tmpSettings,
    settings: state.settings,
  }
};

//const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
)(WheelPage);
