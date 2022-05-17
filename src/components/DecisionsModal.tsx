import React from 'react';
import { IonContent, IonList, IonReorderGroup, IonReorder, IonItem, IonItemSliding, IonItemOptions, IonItemOption, IonIcon, IonFab, IonFabButton, IonAlert, IonModal, IonButton, IonHeader, IonTitle, IonToolbar } from '@ionic/react';
import { ItemReorderEventDetail } from '@ionic/core';
import { RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { add, build, swapVertical } from 'ionicons/icons';
import { v4 as uuidv4 } from 'uuid';

import { Settings } from '../models/Settings';
import { TmpSettings } from '../models/TmpSettings';
import { Decision } from '../models/Decision';
import SelectionItemsModal from './SelectionItemsModal';

interface Props {
  showModal: boolean;
  finish: Function;
  dispatch: Function;
  tmpSettings: TmpSettings;
  settings: Settings;
}

interface State {
  showAddDecisionAlert: boolean;
  selectedDecision: Decision | null;
  showSelectionItemsModal: boolean;
  reorder: boolean;
  showToast: boolean;
  toastMessage: string;
}

interface PageProps extends Props, RouteComponentProps<{
  tab: string;
  path: string;
}> { }

class _DecisionsModal extends React.Component<PageProps, State> {
  decisionListRef: React.RefObject<HTMLIonListElement>;
  constructor(props: any) {
    super(props);
    this.state = {
      showAddDecisionAlert: false,
      selectedDecision: null,
      showSelectionItemsModal: false,
      reorder: false,
      showToast: false,
      toastMessage: '',
    }
    this.decisionListRef = React.createRef<HTMLIonListElement>();
  }

  delDecisionHandler(uuid: string) {
    this.props.dispatch({
      type: "DEL_DECISION",
      uuid: uuid,
    });
  }

  reorderDecisions(event: CustomEvent<ItemReorderEventDetail>) {
    const decisions = event.detail.complete(this.props.settings.decisions);
    this.props.dispatch({
      type: "UPDATE_DECISIONS",
      decisions: decisions,
    });
  }

  getDecisionRows() {
    let decisions = this.props.settings.decisions;
    let rows = Array<object>();
    decisions.forEach((d, i) => {
      rows.push(
        <IonItemSliding key={`decisionItemSliding_` + i}>
          <IonItem key={`decisionItem_` + i}>
            <IonButton fill='clear' key={`decisionSubItem_` + i} size='large' className='uiFont' style={{flex: '1 1 auto'}}
              onClick={e => {
                this.props.dispatch({
                  type: "SET_KEY_VAL",
                  key: 'selectedDecision',
                  val: i,
                });
                this.props.finish();
              }}>
              {d.title}
            </IonButton>

            <IonButton slot='end' size='large' onClick={e => {
              this.setState({ showSelectionItemsModal: true, selectedDecision: d });
            }}>
              <IonIcon icon={build} slot='icon-only' />
            </IonButton>
            <IonReorder slot='end' />
          </IonItem>

          <IonItemOptions side="end">
            <IonItemOption className='uiFont' color='danger' onClick={(e) => {
              this.delDecisionHandler(d.uuid);
              this.decisionListRef.current?.closeSlidingItems();
            }}>刪除</IonItemOption>
          </IonItemOptions>
        </IonItemSliding>
      );
    });
    return rows;
  }

  render() {
    return (
      <IonModal
        cssClass='uiFont'
        swipeToClose={false}
        backdropDismiss={false}
        isOpen={this.props.showModal}
      //presentingElement={router || undefined}
      >
        <IonHeader>
          <IonToolbar>
            <IonTitle className='uiFont'>選擇輪盤</IonTitle>

            <IonButton fill={this.state.reorder ? 'solid' : 'clear'} slot='end'
              onClick={ev => this.setState({ reorder: !this.state.reorder })}>
              <IonIcon icon={swapVertical} slot='icon-only' />
            </IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent className='contentCenter'>
          <IonList key='decisionList0' ref={this.decisionListRef}>
            <IonReorderGroup disabled={!this.state.reorder} onIonItemReorder={(event: CustomEvent<ItemReorderEventDetail>) => { this.reorderDecisions(event); }}>
              {this.getDecisionRows()}
            </IonReorderGroup>
          </IonList>

          <IonFab vertical='bottom' horizontal='end' slot='fixed'>
            <IonFabButton
              onClick={e => {
                this.setState({ showAddDecisionAlert: true });
              }}
            >
              <IonIcon icon={add} />
            </IonFabButton>
          </IonFab>

          <IonAlert
            cssClass='uiFont'
            backdropDismiss={false}
            isOpen={this.state.showAddDecisionAlert}
            header={'請輸入輪盤標題'}
            inputs={[
              {
                name: 'name0',
                type: 'search',
                placeholder: '例：中餐吃什麼？'
              },
            ]}
            buttons={[
              {
                text: '新增',
                cssClass: 'primary uiFont',
                handler: (value) => {
                  this.setState({ showAddDecisionAlert: false });
                  this.props.dispatch({
                    type: "ADD_DECISION",
                    decision: new Decision(uuidv4(), value.name0),
                  });
                },
              },
              {
                text: '取消',
                role: 'cancel',
                cssClass: 'secondary uiFont',
                handler: () => this.setState({ showAddDecisionAlert: false }),
              },
            ]}
          />

          <div>
            <IonButton fill='outline' shape='round' size='large' className='uiFont' onClick={e => {
              this.props.finish();
            }}>關閉</IonButton>
          </div>

          <SelectionItemsModal
            {...{
              selectedDecision: this.state.selectedDecision,
              showModal: this.state.showSelectionItemsModal,
              finish: (newDecision: Decision) => {
                this.setState({ showSelectionItemsModal: false });
                if (newDecision == null) {
                  return;
                }
                let decisions = this.props.settings.decisions;
                const i = decisions.findIndex(d => d.uuid === newDecision.uuid);
                decisions[i] = newDecision;
                this.props.dispatch({
                  type: "UPDATE_DECISIONS",
                  decisions: decisions,
                });
              },
              history: this.props.history,
              match: this.props.match,
              location: this.props.location,
            }}
          />
        </IonContent>
      </IonModal>
    );
  }
};

const mapStateToProps = (state: any /*, ownProps*/) => {
  return {
    decisions: state.items,
    settings: state.settings,
    tmpSettings: state.tmpSettings,
  }
};

//const mapDispatchToProps = {};

//const DecisionsModal = withIonLifeCycle(_DecisionsModal);

export default connect(
  mapStateToProps,
)(_DecisionsModal);
