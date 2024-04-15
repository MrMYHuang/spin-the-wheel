import React from 'react';
import { IonButton, IonContent, IonItem, IonLabel, IonList, IonModal, IonToast, IonToggle } from '@ionic/react';
import { RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import Globals from '../Globals';
import * as qrcode from 'qrcode';
import { withTranslation, WithTranslation } from 'react-i18next';

interface Props extends WithTranslation {
  showModal: boolean;
  text: string;
  finish: Function;
  settings: any;
}

interface PageProps extends Props, RouteComponentProps<{
  tab: string;
  path: string;
}> { }

interface State {
  isAppSettingsExport: Array<boolean>;
  showToast: boolean;
  toastMessage: string;
}

class _ShareTextModal extends React.Component<PageProps, State> {

  constructor(props: any) {
    super(props);
    this.state = {
      isAppSettingsExport: Array<boolean>(Object.keys(Globals.appSettings).length),
      showToast: false,
      toastMessage: '',
    }
  }

  updateQrCode(isAppSettingsExport: boolean[]) {
    const appSettingsExport = Object.keys(Globals.appSettings).filter((key, i) => isAppSettingsExport[i]).map((key, i) => { return { key: key, val: this.props.settings[key] }; });
    let appSettingsString: string | null = appSettingsExport.map(keyVal => `${keyVal.key}=${+keyVal.val}`).join(',');
    appSettingsString = appSettingsString !== '' ? `settings=${appSettingsString}` : null;
    let appUrl = this.props.text;
    const hasQueryString = /\?/.test(appUrl);
    if (appSettingsString) {
      appUrl += hasQueryString ? `&${appSettingsString}` : `?${appSettingsString}`;
    }

    Globals.copyToClipboard(appUrl);
    const qrcCanvas = document.getElementById('qrcCanvas');
    const ctx = (qrcCanvas as HTMLCanvasElement).getContext('2d')!;

    qrcode.toCanvas(qrcCanvas, appUrl).catch((error) => {
      ctx.font = `${this.props.settings.uiFontSize}px sans`;
      ctx.fillStyle = "#ff0000";
      ctx.fillText(`資料過長，無法產生 QR code!`, 0, this.props.settings.uiFontSize);
    });
    return;
  }

  render() {
    return (
      <IonModal
        isOpen={this.props.showModal}
        swipeToClose={true}
        //presentingElement={router || undefined}
        onDidPresent={() => {
          let isAppSettingsExport: Array<boolean> = [];
          for (let i = 0; i < this.state.isAppSettingsExport.length; i++) {
            isAppSettingsExport.push(false);
          }
          this.updateQrCode(isAppSettingsExport);
          this.setState({ isAppSettingsExport: isAppSettingsExport });
        }}
        onDidDismiss={() => this.props.finish()}>
        <IonContent>
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center' }}>
            <div>
              <IonLabel className='uiFont'>{this.props.t('appLinkCopied')}</IonLabel>
            </div>
            <div>
              <IonLabel className='uiFont'>{this.props.t('shareByQr')}:</IonLabel>
            </div>
            <div style={{ flexGrow: 1, flexShrink: 0, display: 'flex', alignItems: 'center', margin: 10 }}>
              <canvas id='qrcCanvas' width='500' height='500' style={{ margin: '0px auto' }} />
            </div>
            <div>
              <IonLabel className='uiFont'>{this.props.t('includAppSettings')}:</IonLabel>
              <IonList>
                {
                  Object.keys(Globals.appSettings).map((key, i) =>
                    <IonItem key={`appSettingExportItem_${i}`}>
                      <IonLabel className='ion-text-wrap uiFont'>{this.props.t(key)}</IonLabel>
                      <IonToggle slot='end' onIonChange={e => {
                        const isAppSettingsExport = this.state.isAppSettingsExport;
                        isAppSettingsExport[i] = e.detail.checked;
                        this.updateQrCode(isAppSettingsExport);
                        this.setState({ isAppSettingsExport: isAppSettingsExport });
                      }} />
                    </IonItem>
                  )
                }
              </IonList>
            </div>
            <div>
              <IonButton fill='outline' shape='round' size='large' onClick={() => this.props.finish()}>{this.props.t('Close')}</IonButton>
            </div>
          </div>

          <IonToast
            cssClass='uiFont'
            isOpen={this.state.showToast}
            onDidDismiss={() => this.setState({ showToast: false })}
            message={this.state.toastMessage}
            duration={2000}
          />
        </IonContent>
      </IonModal>
    );
  }
};

const mapStateToProps = (state: any /*, ownProps*/) => {
  return {
    settings: state.settings,
  }
};

//const mapDispatchToProps = {};

export default withTranslation()(connect(
  mapStateToProps,
)(_ShareTextModal));
