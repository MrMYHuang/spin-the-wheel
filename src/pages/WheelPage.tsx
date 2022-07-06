import React from 'react';
import { IonContent, IonHeader, IonPage, IonToolbar, withIonLifeCycle, IonToast, IonTitle, IonButton, IonRange, IonIcon } from '@ionic/react';
import queryString from 'query-string';
import { shareSocial } from 'ionicons/icons';
import { RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { withTranslation, WithTranslation } from 'react-i18next';

import { Settings } from '../models/Settings';
import { TmpSettings } from '../models/TmpSettings';
import DecisionsModal from '../components/DecisionsModal';
import Wheel from '../components/Wheel';
import { Decision } from '../models/Decision';
import { SelectionItem } from '../models/SelectionItem';
import Globals from '../Globals';

interface Props extends WithTranslation {
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

  get decision() {
    const decisions = this.props.settings.decisions;
    if (decisions.length === 0) {
      return undefined;
    }
    return decisions[this.props.settings.selectedDecision];
  }

  ionViewWillEnter() {
    const queryParams = queryString.parse(this.props.location.search) as any;
    if (queryParams.title) {
      const title = queryParams.title;
      const selections = (queryParams.s || queryParams.sel) as string[];
      const newDecisionIndex = this.props.settings.decisions.length;
      this.props.dispatch({
        type: "ADD_DECISION",
        decision: new Decision(uuidv4(), title, selections.map(v => { 
          return {title: v} as SelectionItem
          })),
      });

      this.props.dispatch({
        type: "SET_KEY_VAL",
        key: 'selectedDecision',
        val: newDecisionIndex,
      });

      this.setState({ showToast: true, toastMessage: `"${title}"${this.props.t('wheelAdded')}` });
      this.props.history.push(`${Globals.pwaUrl}/wheel`);
    }
  }

  spin: Function | null | undefined;
  renderWheel: Function | null | undefined;

  render() {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle className='uiFont'>{this.props.t('wheelPageTitle')}</IonTitle>

            <IonButton fill="clear" slot='end' onClick={e => {
              const thisDecision = `title=${encodeURIComponent(this.decision!.title)}&${this.decision!.selections.map(v => `s=${encodeURIComponent(v.title)}`).join('&')}`;
              const url = `${window.location.origin}${window.location.pathname}?${thisDecision}`;
              Globals.copyToClipboard(url);
              this.props.dispatch({
                type: "TMP_SET_KEY_VAL",
                key: 'shareTextModal',
                val: {
                  show: true,
                  text: url,
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
              {this.decision?.title || <span>&nbsp;</span>}
              <span style={{ color: 'green' }}>{` ` +this.state.selectedItem}</span>
            </div>

            <Wheel updateSelectedItem={(result: any) => {
              this.setState({ selectedItem: result });
            }}
              decision={this.decision}
              setSpin={(spin: Function) => this.spin = spin}
              setRenderWheel={(renderWheel: Function) => this.renderWheel = renderWheel}
            />

            <div style={{ display: 'flex', flexDirection: 'row', verticalAlign: 'middle', width: 'calc(100% - 40px)' }}>
              <span className='uiFont' style={{ marginTop: 'auto', marginBottom: 'auto' }}>{this.props.t('fontSize')}</span>
              <div style={{ marginTop: 'auto', marginBottom: 'auto', flex: '1 1 auto' }}>
                <IonRange min={12} max={128} pin={true} snaps={true} value={this.decision?.fontSize || 24} onIonChange={async e => {
                  if (this.decision == null) {
                    return;
                  }
                  let decisions = JSON.parse(JSON.stringify(this.props.settings.decisions)) as Decision[];
                  let decision = {...this.decision};

                  decision.fontSize = +e.detail.value;
                  const i = decisions.findIndex(d => d.uuid === decision!.uuid);
                  decisions[i] = decision;
                  this.props.dispatch({
                    type: "UPDATE_DECISIONS",
                    decisions: decisions,
                  });
                }} />
              </div>
            </div>

            <div className='buttonsRow'>
              <IonButton fill='outline' shape='round' size='large' className='uiFont' onClick={e => {
                this.setState({ showDecisonsModal: true });
              }}>{this.props.t('Select')}</IonButton>
              <IonButton fill='outline' shape='round' size='large' className='uiFont' onClick={e => {
                this.spin!();
              }}>{this.props.t('Spin')}</IonButton>
            </div>

          </div>

          <DecisionsModal
            {...{
              showModal: this.state.showDecisonsModal,
              finish: () => {
                this.setState({ showDecisonsModal: false, selectedItem: '' });
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

export default withTranslation()(connect(
  mapStateToProps,
)(WheelPage));
