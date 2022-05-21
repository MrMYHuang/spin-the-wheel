import Globals from '../../Globals';
import { Settings } from '../../models/Settings';
import i18n from '../../i18n';

function updateUi(newSettings: Settings) {
  while (document.body.classList.length > 0) {
    document.body.classList.remove(document.body.classList.item(0)!);
  }
  document.body.classList.toggle(`theme${newSettings.theme}`, true);
  Globals.updateCssVars(newSettings);
}

// Used to store settings. They will be saved to file.
export default function reducer(state = new Settings(), action: any) {
  var newSettings = { ...state };
  switch (action.type) {
    case "LOAD_SETTINGS":
      newSettings = JSON.parse(localStorage.getItem(Globals.storeFile)!).settings;
      updateUi(newSettings);
      break;
    case "SET_KEY_VAL":
      var key = action.key;
      var val = action.val;
      switch (key) {
        case 'theme': {
          document.body.classList.forEach((val) => {
            if (/theme/.test(val)) {
              document.body.classList.remove(val);
            }
          });
          document.body.classList.toggle(`theme${val}`, true);
          break;
        }
        case 'language':
          i18n.changeLanguage(val);
          break;
      }

      (newSettings as any)[key] = val;
      localStorage.setItem(Globals.storeFile, JSON.stringify({ settings: newSettings }));
      break;
    case "ADD_DECISION":
      newSettings.decisions = [...newSettings.decisions, action.decision];
      localStorage.setItem(Globals.storeFile, JSON.stringify({ settings: newSettings }));
      break;
    case "DEL_DECISION": {
      let temp = newSettings.decisions;
      const idxToDel = temp.findIndex((b) => { return b.uuid === action.uuid });
      if (idxToDel !== -1) {
        temp.splice(idxToDel, 1);
      }
      newSettings.decisions = [...temp];
      const prevIdx = idxToDel - 1;
      if (prevIdx < newSettings.decisions.length) {
        newSettings.selectedDecision = prevIdx >= 0 ? prevIdx : 0;
      }
      localStorage.setItem(Globals.storeFile, JSON.stringify({ settings: newSettings }));
      break;
    }
    case "UPDATE_DECISIONS": {
      newSettings.decisions = action.decisions;
      localStorage.setItem(Globals.storeFile, JSON.stringify({ settings: newSettings }));
      break;
    }
    // @ts-ignore
    case "DEFAULT_SETTINGS":
      newSettings = new Settings();
      updateUi(newSettings);
      break;
    // eslint-disable-next-line
    default:
      if (Object.keys(newSettings).length === 0) {
        newSettings = new Settings();
      }
      const defaultSettings = new Settings();
      Object.keys(defaultSettings).forEach(key => {
        if ((newSettings as any)[key] === undefined) {
          (newSettings as any)[key] = (defaultSettings as any)[key];
        }
      });
      i18n.changeLanguage(newSettings.language);
  }
  return newSettings;
}
