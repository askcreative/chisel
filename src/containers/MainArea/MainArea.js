import React, {Component, PropTypes} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import CSSModules from 'react-css-modules';

import ModelsList from 'components/mainArea/models/ModelsList/ModelsList';
import ContentList from 'components/mainArea/content/ContentList/ContentList';
import ContentEdit from 'components/mainArea/content/ContentEdit/ContentEdit';
import Sharing from 'components/mainArea/sharing/Sharing';
import Model from 'components/mainArea/models/Model/Model';
import {addCollaboration, updateCollaboration, deleteCollaboration, addModel, setCurrentModel, updateModel, deleteModel, addField, removeField} from 'ducks/models';
import {addItem, updateItem, setCurrentItem, deleteItem} from 'ducks/content';
import {addMediaItem, updateMediaItem, removeMediaItem} from 'ducks/media';
import {PAGE_MODELS, PAGE_CONTENT, PAGE_API, PAGE_SETTINGS, PAGE_SHARING, showAlert, closeModel, closeContentItem, showModal} from 'ducks/nav';
import InlineSVG from 'svg-inline-react';

import styles from './MainArea.sss';


@CSSModules(styles, {allowMultiple: true})
export class MainArea extends Component  {
  render() {
    const {models, content, nav} = this.props;
    const {addCollaboration, updateCollaboration, deleteCollaboration, addModel, setCurrentModel, updateModel, deleteModel, addField, removeField} = this.props.modelsActions;
    const {addItem, updateItem, setCurrentItem} = this.props.contentActions;
    const {showAlert, closeModel, closeContentItem, showModal} = this.props.navActions;
    const {addMediaItem, updateMediaItem, removeMediaItem} = this.props.mediaActions;

    let isEditable = models.isOwner || models.isAdmin;
    let curSite = models.currentSite;

    let Area = (
      <div styleName="start-working">
        <InlineSVG styleName="hammer" src={require("./hammer.svg")}/>
        Add new site to start working
        <div styleName="hint">Find "Add new site" button at sidebar</div>
      </div>
    );
    
    switch (nav.openedPage) {
      case PAGE_MODELS:
        if (curSite)
          Area = (
            <ModelsList models={curSite.models}
                        setCurrentModel={setCurrentModel}
                        addModel={addModel}
                        deleteModel={deleteModel}
                        showAlert={showAlert}
                        alertShowing={nav.alertShowing}
                        isEditable={isEditable} />
          );

        if (nav.openedModel)
          Area = (
            <Model model={models.currentModel}
                   onClose={closeModel}
                   updateModel={updateModel}
                   addField={addField}
                   removeField={removeField}
                   showAlert={showAlert}
                   showModal={showModal}
                   modalShowing={nav.modalShowing}
                   alertShowing={nav.alertShowing}
                   isEditable={isEditable} />
          );

        break;

      case PAGE_CONTENT:
        if (nav.openedContentItem) {
          Area = (
            <ContentEdit item={content.currentItem}
                         onClose={closeContentItem}
                         updateItem={updateItem}
                         addMediaItem={addMediaItem}
                         updateMediaItem={updateMediaItem}
                         removeMediaItem={removeMediaItem}
                         showModal={showModal}
                         isEditable={isEditable}/>
          );
        } else if (curSite && curSite.models.length) {
          let items = [];
          for (let item of content.items) {
            if (item.model.site == curSite)
              items.push(item);
          }
          Area = (
            <ContentList items={items}
                         models={curSite.models}
                         setCurrentItem={setCurrentItem}
                         addItem={addItem}
                         deleteItem={deleteItem}
                         showAlert={showAlert}
                         alertShowing={nav.alertShowing}
                         isEditable={isEditable}/>
          );
        } else if (curSite) {
          Area = (
            <div styleName="start-working">
              <InlineSVG styleName="hammer" src={require("./hammer.svg")}/>
              Add any model to start creating content
            </div>
          );
        }

        break;

      case PAGE_SHARING:
        Area = (
          <Sharing collaborations={curSite.collaborations}
                   owner={curSite.owner}
                   addCollaboration={addCollaboration}
                   updateCollaboration={updateCollaboration}
                   deleteCollaboration={deleteCollaboration}
                   showAlert={showAlert}
                   alertShowing={nav.alertShowing}
                   isEditable={models.isOwner} />
        );
        break;

      case PAGE_API:
        Area = (
          <div styleName="start-working">
            <InlineSVG styleName="hammer" src={require("./hammer.svg")}/>
            <div styleName="docs">
              Check <a styleName="docs-link" href="http://parseplatform.github.io/docs/" target="_blank">Parse</a> docs!
            </div>
          </div>
        );
        break;

      case PAGE_SETTINGS:
        Area = (
          <div styleName="start-working">
            <InlineSVG styleName="hammer" src={require("./hammer.svg")}/>
            There is no any settings yet
          </div>
        );
        break;
    }

    return (
      <div styleName="mainArea">
        {Area}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    models:   state.models,
    content:  state.content,
    nav:      state.nav
  };
}

function mapDispatchToProps(dispatch) {
  return {
    modelsActions:  bindActionCreators({addCollaboration, updateCollaboration, deleteCollaboration, addModel, setCurrentModel, updateModel, deleteModel, addField, removeField}, dispatch),
    contentActions: bindActionCreators({addItem, updateItem, setCurrentItem, deleteItem}, dispatch),
    navActions:     bindActionCreators({showAlert, closeModel, closeContentItem, showModal}, dispatch),
    mediaActions:   bindActionCreators({addMediaItem, updateMediaItem, removeMediaItem}, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MainArea);
