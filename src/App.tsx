import React from 'react';
import { Redirect, Route, RouteComponentProps, withRouter } from 'react-router-dom';
import {
  setupIonicReact,
  IonApp,
  IonRouterOutlet,
  IonAlert,
  IonToast,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { connect, Provider } from 'react-redux';
import queryString from 'query-string';
import { withTranslation, WithTranslation } from 'react-i18next';

import getSavedStore from './redux/store';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import Globals from './Globals';
import ShareTextModal from './components/ShareTextModal';
import { Settings } from './models/Settings';
import { TmpSettings } from './models/TmpSettings';
import WheelPage from './pages/WheelPage';

let store = getSavedStore();
/*
class DebugRouter extends IonReactRouter {
  constructor(props: any) {
    super(props);
    console.log('initial history is: ', JSON.stringify(this.history, null, 2))
    this.history.listen((location, action) => {
      console.log(
        `The current URL is ${location.pathname}${location.search}${location.hash}`
      )
      console.log(`The last navigation action was ${action}`, JSON.stringify(this.history, null, 2));
    });
  }
}
*/

setupIonicReact({
  mode: 'md', // Use a consistent UI style across Android and iOS.
  swipeBackEnabled: false,
});

export var serviceWorkCallbacks = {
  onSuccess: function (registration: ServiceWorkerRegistration) { },
  onUpdate: function (registration: ServiceWorkerRegistration) { },
};

interface Props extends WithTranslation {
  dispatch: Function;
  shareTextModal: any;
  settings: Settings;
  tmpSettings: TmpSettings;
}

interface PageProps extends Props, RouteComponentProps<{
  tab: string;
  path: string;
}> { }

interface AppOrigProps extends Props, RouteComponentProps<{
  tab: string;
  path: string;
}> { }

interface State {
  showToast: boolean;
  toastMessage: string;
  showUpdateAlert: boolean;
  showRestoreAppSettingsToast: boolean;
}

class _App extends React.Component<PageProps> {
  render() {
    return (
      <Provider store={store}>
        <AppOrig {...this.props} />
      </Provider>
    );
  }
}

class _AppOrig extends React.Component<AppOrigProps, State> {
  registrationNew: ServiceWorkerRegistration | null;
  originalAppSettingsStr: string | null | undefined;
  queryParams: any;

  constructor(props: any) {
    super(props);
    if (!this.props.settings.hasAppLog) {
      Globals.disableAppLog();
    }

    Globals.electronBackendApi?.receive("fromMain", (data: any) => {
      switch (data.event) {
        case 'version':
          this.props.dispatch({
            type: "TMP_SET_KEY_VAL",
            key: 'mainVersion',
            val: data.version,
          });
          break;
      }
    });
    Globals.electronBackendApi?.send("toMain", { event: 'ready' });

    this.registrationNew = null;

    // ----- Initializing UI settings -----
    // Apply the theme setting.
    while (document.body.classList.length > 0) {
      document.body.classList.remove(document.body.classList.item(0)!);
    }
    document.body.classList.toggle(`theme${this.props.settings.theme}`, true);

    // Modify UI settings from query string.
    this.queryParams = queryString.parse(this.props.location.search) as any;
    if (this.queryParams.settings) {
      this.originalAppSettingsStr = localStorage.getItem(Globals.storeFile);
      (this.queryParams.settings as string).split(',').forEach(setting => {
        const keyVal = setting.split('=');
        this.props.dispatch({
          type: "SET_KEY_VAL",
          key: keyVal[0],
          val: +keyVal[1],
        });
      });
    }
    Globals.updateCssVars(store.getState().settings);

    this.state = {
      showUpdateAlert: false,
      showRestoreAppSettingsToast: (this.queryParams.settings != null && this.originalAppSettingsStr != null) || false,
      showToast: false,
      toastMessage: '',
    };

    serviceWorkCallbacks.onUpdate = (registration: ServiceWorkerRegistration) => {
      this.registrationNew = registration;
      this.setState({ showUpdateAlert: true });
    };

    serviceWorkCallbacks.onSuccess = (registration: ServiceWorkerRegistration) => {
    };

    // Preload speechSynthesis.
    if (typeof speechSynthesis !== 'undefined') {
      speechSynthesis.getVoices();
      speechSynthesis.cancel();
    }

    // Enable screen wake lock.
    if ((navigator as any).wakeLock) {
      this.wakeLockScreen();
      document.addEventListener("visibilitychange", async () => {
        if (document.visibilityState === 'visible') {
          this.wakeLockScreen();
        } else {
          this.wakeLockScreenRelease()
        }
      });
    }
  }

  restoreAppSettings() {
    localStorage.setItem(Globals.storeFile, this.originalAppSettingsStr!);
    this.props.dispatch({ type: 'LOAD_SETTINGS' });
  }

  // Prevent device from sleeping.
  wakeLock: any;
  async wakeLockScreen() {
    try {
      const wakeLock = (navigator as any).wakeLock;
      if (wakeLock != null) {
        this.wakeLock = await wakeLock.request('screen');
        console.log('Screen wake lock is requested.');
      } else {
        console.error('navigator.wakeLock is undefined.');
      }
    } catch (err: any) {
      // the wake lock request fails - usually system related, such low as battery
      console.log(`${err.name}, ${err.message}`);
      console.log(new Error().stack);
    }
  }

  async wakeLockScreenRelease() {
    if (this.wakeLock != null) {
      await this.wakeLock.release();
      this.wakeLock = null;
      console.log('Screen wake lock is released.');
    }
  }

  routeByQueryString() {
    // This app uses client side routing. 
    // Without the first loading of this app,
    // any client side route becomes a server side route!
    // These invalid server side routings cause 404 errors.
    // To workaround these errors, we can use GitHub 404.html redirection
    // to pass the client side routes to this app by using query string.
    // After this app loads, it can use the query string to correctly redirect to
    // a client side route!
    console.log(window.location.search);
    const routeMatches = /route=([^&]*)/.exec(window.location.search);
    const queryMatches = /query=([^&]*)/.exec(window.location.search);
    if (routeMatches !== null) {
      const route = decodeURIComponent(routeMatches[1]);

      let query = '';
      if (queryMatches !== null) {
        query = decodeURIComponent(queryMatches[1]);
      }
      return <Redirect to={`${Globals.pwaUrl}` + route + query} />;
    } else if (window.location.pathname === `${Globals.pwaUrl}/` || window.location.pathname === `${Globals.pwaUrl}`) {
      return <Redirect to={`${Globals.pwaUrl}/wheel`} />;
    }
  }

  render() {
    return (
      <IonApp>
        <IonReactRouter>
          <IonRouterOutlet animated={false}>
            {/* The following route is for backward compatibility. */}
            <Route path={`${Globals.pwaUrl}/wheel`} render={(props: any) => <WheelPage {...props} />} exact={true} />
            <Route path={`${Globals.pwaUrl}/`} render={() => { return this.routeByQueryString(); }} exact={true} />
          </IonRouterOutlet>
        </IonReactRouter>

        <IonAlert
          cssClass='uiFont'
          backdropDismiss={false}
          isOpen={!this.props.settings.appInitialized || this.props.tmpSettings.showLangSelector}
          header={this.props.t('selectLang')}
          inputs={[
            {
              name: 'radio0',
              type: 'radio',
              label: 'English',
              value: 'en',
              checked: this.props.settings.language === 'en',
            },
            {
              name: 'radio1',
              type: 'radio',
              label: '中文',
              value: 'zh',
              checked: this.props.settings.language === 'zh',
            },
          ]}
          buttons={[
            {
              text: this.props.t('Ok'),
              cssClass: 'primary uiFont',
              handler: async (value) => {
                this.props.dispatch({
                  type: "SET_KEY_VAL",
                  key: 'language',
                  val: value,
                });
                this.props.dispatch({
                  type: "SET_KEY_VAL",
                  key: 'appInitialized',
                  val: true,
                });
                this.props.dispatch({
                  type: "TMP_SET_KEY_VAL",
                  key: 'showLangSelector',
                  val: false,
                });
              },
            },
          ]}
        />

        <IonAlert
          cssClass='uiFont'
          isOpen={this.state.showUpdateAlert}
          backdropDismiss={false}
          onDidPresent={(ev) => {
            // Run SKIP_WAITING at onDidPresent event to avoid a race condition of
            // an old page fetching old JS chunks with a new service worker!
            this.registrationNew?.installing?.postMessage({ type: 'SKIP_WAITING' });
            this.registrationNew?.waiting?.postMessage({ type: 'SKIP_WAITING' });
          }}
          header={this.props.t('updateMsg')}
          buttons={[
            {
              text: this.props.t('Close'),
              cssClass: 'primary uiFont',
              handler: (value) => {
                this.setState({
                  showUpdateAlert: false,
                });
              },
            }
          ]}
        />

        <ShareTextModal
          {...{
            text: this.props.shareTextModal?.text,
            showModal: this.props.shareTextModal?.show || false,
            finish: () => {
              this.props.dispatch({
                type: "TMP_SET_KEY_VAL",
                key: 'shareTextModal',
                val: { show: false },
              });
            }, ...this.props
          }}
        />

        <IonToast
          cssClass='uiFont'
          isOpen={this.state.showRestoreAppSettingsToast}
          onDidDismiss={() => this.setState({ showRestoreAppSettingsToast: false })}
          message={this.props.t('appSettingsApplied')}
          buttons={[
            {
              text: this.props.t('Cancel'),
              role: 'cancel',
              handler: () => this.setState({ showRestoreAppSettingsToast: false })
            },
            {
              text: this.props.t('Restore'),
              handler: () => this.restoreAppSettings(),
            },
          ]}
        />

        <IonToast
          cssClass='uiFont'
          isOpen={this.state.showToast}
          onDidDismiss={() => this.setState({ showToast: false })}
          message={this.state.toastMessage}
          duration={2000}
        />
      </IonApp>
    );
  }
}

const mapStateToProps = (state: any /*, ownProps*/) => {
  return {
    shareTextModal: state.tmpSettings.shareTextModal,
    settings: state.settings,
    tmpSettings: state.tmpSettings,
  }
};

const AppOrig = connect(
  mapStateToProps,
)(_AppOrig);


const App = withTranslation()(withRouter(_App));

export default App;
