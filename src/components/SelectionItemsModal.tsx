import React from 'react';
import { IonContent, IonList, IonReorderGroup, IonReorder, IonItem, IonItemSliding, IonItemOptions, IonItemOption, IonIcon, IonToast, IonFab, IonFabButton, IonModal, IonButton, IonHeader, IonTitle, IonToolbar, IonInput } from '@ionic/react';
import { ItemReorderEventDetail } from '@ionic/core';
import { RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { add, swapVertical } from 'ionicons/icons';
import { withTranslation, WithTranslation } from 'react-i18next';

import { Decision } from '../models/Decision';
import { SelectionItem } from '../models/SelectionItem';

interface Props extends WithTranslation {
  showModal: boolean;
  selectedDecision: Decision | null;
  finish: Function;
  dispatch: Function;
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
      // Copy object by JSON calls.
      newDecision: JSON.parse(JSON.stringify(this.props.selectedDecision)),
      showAddSelectionItemAlert: false,
      reorder: false,
      showToast: false,
      toastMessage: '',
    }
    this.bookmarkListRef = React.createRef<HTMLIonListElement>();
  }

  componentDidUpdate(prevProps: any) {
      if (this.props.selectedDecision !== prevProps.selectedDecision) {
        this.setState({newDecision: JSON.parse(JSON.stringify(this.props.selectedDecision))})
      }
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
    let rows = Array<JSX.Element>();
    this.state.newDecision.selections.forEach((d, i) => {
      rows.push(
        <IonItemSliding key={`selectionItemSliding_` + i}>
          <IonItem key={`selectionItem_` + i} className='uiFont' button={true}
            onClick={e => {
            }}>

            <IonInput
              value={d.title}
              placeholder={this.props.t('newItem')}
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
            }}>{this.props.t('Delete')}</IonItemOption>
          </IonItemOptions>
        </IonItemSliding>
      );
    });
    return rows;
  }

  render() {
    if (this.state.newDecision == null) {
      return <></>;
    }

    return (
      <IonModal
        swipeToClose={false}
        backdropDismiss={false}
        isOpen={this.props.showModal}
        /*
        onWillPresent={() =>
          this.setState({newDecision: JSON.parse(JSON.stringify(this.decision))})
        }*/
      //presentingElement={router || undefined}
      >
        <IonHeader>
          <IonToolbar>
            <IonTitle className='uiFont'>{this.props.t('editWheel')}</IonTitle>

            <IonButton fill={this.state.reorder ? 'solid' : 'clear'} slot='end'
              onClick={ev => this.setState({ reorder: !this.state.reorder })}>
              <IonIcon icon={swapVertical} slot='icon-only' />
            </IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent className='contentCenter'>

          <IonInput
            value={this.state.newDecision.title}
            placeholder={this.props.t('wheelTitle')}
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
                newDecision.selections.push({ title: '' } as SelectionItem);
                this.setState({ newDecision });
              }}
            >
              <IonIcon icon={add} />
            </IonFabButton>
          </IonFab>

          <div className='buttonsRow'>
            <IonButton fill='outline' shape='round' size='large' className='uiFont' onClick={e => {
              this.props.finish(this.state.newDecision);
            }}>{this.props.t('Save')}</IonButton>

            <IonButton fill='outline' shape='round' size='large' className='uiFont' onClick={e => {
              this.props.finish();
            }}>{this.props.t('Cancel')}</IonButton>
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
  }
};

//const mapDispatchToProps = {};

//const SelectionItemsModal = withIonLifeCycle(_SelectionItemsModal);

export default withTranslation()(connect(
  mapStateToProps,
)(_SelectionItemsModal));
