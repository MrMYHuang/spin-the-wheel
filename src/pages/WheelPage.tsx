import React from 'react';
import { IonContent, IonHeader, IonPage, IonToolbar, withIonLifeCycle, IonToast, IonTitle, IonButton, IonRange, IonIcon } from '@ionic/react';
import { shareSocial } from 'ionicons/icons';
import { RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';

import { Settings } from '../models/Settings';
import { TmpSettings } from '../models/TmpSettings';
import DecisionsModal from '../components/DecisionsModal';
import Wheel from '../components/Wheel';

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
  }

  decision() {
    const decisions = this.props.settings.decisions;
    if (decisions.length === 0) {
      return undefined;
    }
    return decisions[this.props.settings.selectedDecision]
  }

  ionViewWillEnter() {
    //console.log(`${this.props.match.url} will enter`);
  }

  spin: Function | null | undefined;
  renderWheel: Function | null | undefined;

  render() {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle className='uiFont'>幸運輪盤</IonTitle>

            <IonButton fill="clear" slot='end' onClick={e => {
              const thisDecision = `title=${encodeURIComponent(this.decision()!.title)}&${this.decision()!.selections.map(v => `s=${encodeURIComponent(v.title)}`).join('&')}`;
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
            <div style={{ flex: '0 0 auto', fontSize: this.decision()?.fontSize || 24 }}>
              {this.decision()?.title || <span>&nbsp;</span>}
              <span style={{ color: 'red' }}>{this.state.selectedItem}</span>
            </div>

            <Wheel updateSelectedItem={(result: any) => {
              this.setState({ selectedItem: result });
            }}
              decision={this.decision.bind(this)}
              setSpin={(spin: Function) => this.spin = spin}
              setRenderWheel={(renderWheel: Function) => this.renderWheel = renderWheel}
            />

            <div style={{ display: 'flex', flexDirection: 'row', verticalAlign: 'middle', width: 'calc(100% - 40px)' }}>
              <span className='uiFont' style={{ marginTop: 'auto', marginBottom: 'auto' }}>文字大小</span>
              <div style={{ marginTop: 'auto', marginBottom: 'auto', flex: '1 1 auto' }}>
                <IonRange min={12} max={128} pin={true} snaps={true} value={this.decision()?.fontSize || 24} onIonChange={async e => {
                  let decisions = this.props.settings.decisions;
                  let decision = this.decision()!;

                  if (decision == null) {
                    return;
                  }

                  decision.fontSize = +e.detail.value;
                  const i = decisions.findIndex(d => d.uuid === decision.uuid);
                  decisions[i] = decision;
                  this.props.dispatch({
                    type: "UPDATE_DECISIONS",
                    decisions: decisions,
                  });
                  setImmediate(() => {
                    this.renderWheel!();
                  });
                }} />
              </div>
            </div>

            <div className='buttonsRow'>
              <IonButton fill='outline' shape='round' size='large' className='uiFont' onClick={e => {
                this.setState({ showDecisonsModal: true });
              }}>選擇</IonButton>
              <IonButton fill='outline' shape='round' size='large' className='uiFont' onClick={e => {
                this.spin!();
              }}>轉動</IonButton>
            </div>

          </div>

          <DecisionsModal
            {...{
              showModal: this.state.showDecisonsModal,
              finish: () => {
                this.setState({ showDecisonsModal: false, selectedItem: '' });
                setImmediate(() => {
                  this.renderWheel!();
                });
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
