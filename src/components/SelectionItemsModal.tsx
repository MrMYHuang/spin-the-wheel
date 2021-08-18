import React from 'react';
import { IonContent, IonList, IonReorderGroup, IonReorder, IonItem, IonItemSliding, IonItemOptions, IonItemOption, IonIcon, IonToast, IonFab, IonFabButton, IonModal, IonButton, IonHeader, IonTitle, IonToolbar, IonInput } from '@ionic/react';
import { ItemReorderEventDetail } from '@ionic/core';
import { RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { add, swapVertical } from 'ionicons/icons';

import { Settings } from '../models/Settings';
import { TmpSettings } from '../models/TmpSettings';
import { Decision } from '../models/Decision';
import { SelectionItem } from '../models/SelectionItem';

interface Props {
  showModal: boolean;
  selectedDecision: number;
  finish: Function;
  dispatch: Function;
  tmpSettings: TmpSettings;
  settings: Settings;
}

interface State {
  newDecision: Decision;
  showAddSelectionItemAlert: boolean;
  reorder: boolean;
  showToast: boolean;
  toastMessage: string;
}

interface PageProps extends Props, RouteComponentProps<{
  tab: string;
  path: string;
}> { }

class _SelectionItemsModal extends React.Component<PageProps, State> {
  bookmarkListRef: React.RefObject<HTMLIonListElement>;
  constructor(props: any) {
    super(props);
    this.state = {
      newDecision: JSON.parse(JSON.stringify(this.decision)),
      showAddSelectionItemAlert: false,
      reorder: false,
      showToast: false,
      toastMessage: '',
    }
    this.bookmarkListRef = React.createRef<HTMLIonListElement>();
  }

  get decision() {
    const decisions = this.props.settings.decisions;
    return decisions[this.props.selectedDecision]
  }

  delBookmarkHandler(i: number) {
    let newDecision = this.state.newDecision;
    newDecision.selections.splice(i, 1);
    this.setState({ newDecision });
  }

  reorderBookmarks(event: CustomEvent<ItemReorderEventDetail>) {
    let newDecision = this.state.newDecision;
    newDecision.selections = event.detail.complete(newDecision.selections);
    this.setState({ newDecision });    
  }

  getBookmarkRows() {
    let rows = Array<object>();
    this.state.newDecision.selections.forEach((d, i) => {
      rows.push(
        <IonItemSliding key={`selectionItemSliding_` + i}>
          <IonItem key={`selectionItem_` + i} className='uiFont' button={true}
            onClick={e => {
            }}>

            <IonInput
              value={d.title}
              clearInput
              className='ionInput'
              onIonChange={e => {
                let newDecision = this.state.newDecision;
                newDecision.selections[i].title = e.detail.value || '';
                this.setState({ newDecision });
              }}></IonInput>
            <IonReorder slot='end' />
          </IonItem>

          <IonItemOptions side="end">
            <IonItemOption className='uiFont' color='danger' onClick={(e) => {
              this.delBookmarkHandler(i);
              this.bookmarkListRef.current?.closeSlidingItems();
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
        onWillPresent={() =>
          this.setState({newDecision: JSON.parse(JSON.stringify(this.decision))})
        }
      //presentingElement={router || undefined}
      >
        <IonHeader>
          <IonToolbar>
            <IonTitle className='uiFont'>編輯輪盤</IonTitle>

            <IonButton fill={this.state.reorder ? 'solid' : 'clear'} slot='end'
              onClick={ev => this.setState({ reorder: !this.state.reorder })}>
              <IonIcon icon={swapVertical} slot='icon-only' />
            </IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent className='contentCenter'>

          <IonInput
            value={this.state.newDecision.title}
            clearInput
            className='ionInput'
            onIonChange={e => {
              let newDecision = this.state.newDecision;
              newDecision.title = e.detail.value || '';
              this.setState({ newDecision });
            }}>
          </IonInput>

          <IonList key='bookmarkList0' ref={this.bookmarkListRef}>
            <IonReorderGroup disabled={!this.state.reorder} onIonItemReorder={(event: CustomEvent<ItemReorderEventDetail>) => { this.reorderBookmarks(event); }}>
              {this.getBookmarkRows()}
            </IonReorderGroup>
          </IonList>

          <IonFab vertical='bottom' horizontal='end' slot='fixed'>
            <IonFabButton
              onClick={e => {
                let newDecision = this.state.newDecision;
                newDecision.selections.push(new SelectionItem({ title: '新選項' }));
                this.setState({ newDecision });
              }}
            >
              <IonIcon icon={add} />
            </IonFabButton>
          </IonFab>

          <div className='buttonsRow'>
            <IonButton fill='outline' shape='round' size='large' className='uiFont' onClick={e => {
              let decisions = this.props.settings.decisions;
              const i = decisions.findIndex(d => d.uuid === this.state.newDecision.uuid);
              decisions[i] = this.state.newDecision;
              this.props.dispatch({
                type: "UPDATE_DECISIONS",
                decisions: decisions,
              });
              this.props.finish();
            }}>儲存</IonButton>

            <IonButton fill='outline' shape='round' size='large' className='uiFont' onClick={e => {
              this.props.finish();
            }}>取消</IonButton>
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
    decisions: state.items,
    settings: state.settings,
    tmpSettings: state.tmpSettings,
  }
};

//const mapDispatchToProps = {};

//const SelectionItemsModal = withIonLifeCycle(_SelectionItemsModal);

export default connect(
  mapStateToProps,
)(_SelectionItemsModal);
