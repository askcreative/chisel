import React, {Component, PropTypes} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import CSSModules from 'react-css-modules';

import ModelsList from 'components/mainArea/models/ModelsList/ModelsList';
import ContentList from 'components/mainArea/content/ContentList/ContentList';
import ContentEdit from 'components/mainArea/content/ContentEdit/ContentEdit';
import Sharing from 'components/mainArea/sharing/Sharing';
import Model from 'components/mainArea/models/Model/Model';
import {addCollaboration, addModel, updateModel, setCurrentModel, addField, removeField} from 'ducks/models';
import {PAGE_MODELS, PAGE_CONTENT, PAGE_API, PAGE_SETTINGS, PAGE_SHARING, showAlert, closeModel, showModal} from 'ducks/nav';

import styles from './MainArea.sss';


@CSSModules(styles, {allowMultiple: true})
export default class MainArea extends Component  {
  render() {
    const {models, nav} = this.props;
    const {addCollaboration, addModel, setCurrentModel, updateModel, addField, removeField} = this.props.modelsActions;
    const {showAlert, closeModel, showModal} = this.props.navActions;

    let Area = (
      <div>
        Create site to start working
      </div>
    );
    switch (nav.openedPage) {
      case PAGE_MODELS:
        if (models.currentSite) {
          Area = (
            <ModelsList models={models.currentSite.models}
                        setCurrentModel={setCurrentModel}
                        addModel={addModel}
                        showAlert={showAlert}
                        alertShowing={nav.alertShowing} />
          );
        }
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
                   alertShowing={nav.alertShowing}/>
          );

        break;

      case PAGE_CONTENT:
        Area = (
          <ContentEdit />
        );

        break;

      case PAGE_SHARING:
        Area = (
          <Sharing collaborations={models.currentSite.collaborations}
                   owner={models.currentSite.owner}
                   isOwner={models.isOwner}
                   isAdmin={models.isAdmin}
                   addCollaboration={addCollaboration}
                   showAlert={showAlert}
                   alertShowing={nav.alertShowing} />
        );
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
    models: state.models,
    nav:    state.nav
  };
}

function mapDispatchToProps(dispatch) {
  return {
    modelsActions:  bindActionCreators({addCollaboration, addModel, updateModel, setCurrentModel, addField, removeField}, dispatch),
    navActions:     bindActionCreators({showAlert, closeModel, showModal}, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MainArea);
