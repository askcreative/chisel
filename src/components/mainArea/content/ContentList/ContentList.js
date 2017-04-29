import React, {Component, PropTypes} from 'react';
import CSSModules from 'react-css-modules';
import InlineSVG from 'svg-inline-react';

import {ContentItemData, STATUS_DRAFT, STATUS_PUBLISHED, STATUS_UPDATED, STATUS_ARCHIEVED} from 'models/ContentData';
import DropdownControl from 'components/elements/DropdownControl/DropdownControl';
import ContainerComponent from 'components/elements/ContainerComponent/ContainerComponent';
import InputControl from 'components/elements/InputControl/InputControl';
import {getModelByName} from 'utils/data';
import {getRelativeTime} from 'utils/common';
import {ALERT_TYPE_CONFIRM} from 'components/modals/AlertModal/AlertModal';

import styles from './ContentList.sss';


const allStatuses = [STATUS_DRAFT, STATUS_PUBLISHED, STATUS_UPDATED, STATUS_ARCHIEVED];

@CSSModules(styles, {allowMultiple: true})
export default class ContentList extends Component {
  state = {
    items: [],
    itemTitle: "",

    activeModels: new Set(),
    activeStatuses: new Set(),

    currentModel: null
  };

  
  componentWillMount() {
    this.setState({
      items: this.props.items,
      currentModel: this.props.models[0]
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({items: nextProps.items});
    if (nextProps.items != this.state.items)
      this.setState({itemTitle: ""});
  }

  //TODO криво как-то
  onChangeModel = name => {
    let model = getModelByName(name);
    this.setState({currentModel: model});
  };

  onItemTitleChange = event => {
    let title = event.target.value;
    this.setState({itemTitle: title});
  };

  onKeyDown = event => {
    if (this.props.alertShowing)
      return;
    //Enter pressed
    if (event.keyCode == 13) {
      this.onAddItem();
    //Esc pressed
    } else if (event.keyCode == 27) {
      this.setState({itemTitle: ""});
    }
  };

  onAddItem = event => {
    if (event)
      event.preventDefault();
  
    let item = new ContentItemData();
    item.model = this.state.currentModel;
    item.title = this.state.itemTitle;
    this.props.addItem(item);
    
    this.setState({itemTitle: ""});
  };

  onItemClick = item => {
    const {gotoItem} = this.props;
    gotoItem(item);
  };

  onModelClick = model => {
    let models = this.state.activeModels;
    if (models.has(model))
      models.delete(model);
    else
      models.add(model);
    this.setState({activeModels: models, currentModel: model});
  };

  onStatusClick = status => {
    let statuses = this.state.activeStatuses;
    if (statuses.has(status))
      statuses.delete(status);
    else
      statuses.add(status);
    this.setState({activeStatuses: statuses});
  };
  
  onRemoveClick = (event, item) => {
    event.stopPropagation();
    const {showAlert, deleteItem} = this.props;
    let title = item.title ? item.title : 'content item';
    
    let params = {
      type: ALERT_TYPE_CONFIRM,
      title: `Deleting ${title}`,
      description: "Are you sure?",
      onConfirm: () => deleteItem(item)
    };
    showAlert(params);
    this.alertShowed = true;
  };

  render() {
    const {isEditable, models} = this.props;

    let eyeDisabled = <img styleName="eye" src={require("./eye-gray.png")} />;
    let eyeEnabled = <img styleName="eye eye-active" src={require("./eye.png")} />;

    return (
      <ContainerComponent title="Content">
        <div styleName="content-wrapper">
          <div styleName="filters">
            <div styleName="filters-item">
              <div styleName="filters-title">
                Content Types
              </div>
              {
                models.map(model => {
                  let key = model.origin && model.origin.id ? model.origin.id : Math.random();

                  let eye = eyeDisabled;
                  let styleName = "filters-type filters-typeHidden";
                  if (this.state.activeModels.has(model)) {
                    eye = eyeEnabled;
                    styleName = "filters-type";
                  }

                  return(
                    <div styleName={styleName} key={key} onClick={() => this.onModelClick(model)}>
                      {model.name}
                      {eye}
                    </div>
                  );
                })
              }
            </div>
            <div styleName="filters-item">
              <div styleName="filters-title filters-status">
                Status
              </div>
              {
                allStatuses.map(status => {
                  let eye = eyeDisabled;
                  let styleName = "filters-type filters-typeHidden";
                  if (this.state.activeStatuses.has(status)) {
                    eye = eyeEnabled;
                    styleName = "filters-type";
                  }
      
                  return(
                    <div styleName={styleName} key={status} onClick={() => this.onStatusClick(status)}>
                      {status}
                      {eye}
                    </div>
                  );
                })
              }
            </div>
          </div>
          
          <div styleName="list-wrapper">
            <div styleName="list">
              {
                this.state.items.length > 0 &&
                  <div styleName="list-item">
                    <div styleName="colorLabel"></div>
                    <div styleName="type"></div>
                    <div styleName="updated">UPDATED</div>
                  </div>
              }
              {
                this.state.items
                  .filter(item => !this.state.activeModels.size || this.state.activeModels.has(item.model))
                  .filter(item => !this.state.activeStatuses.size || this.state.activeStatuses.has(item.status))
                  .map(item => {
                    let title = item.draft ? item.draft.title : item.title;
                    
                    let updatedDate = item.draft ? item.draft.origin.updatedAt : item.origin.updatedAt;
                    if (!updatedDate)
                      updatedDate = new Date();
                    let updatedStr = getRelativeTime(updatedDate);
  
                    let colorStyle = {background: item.color};
                    let key = item.origin && item.origin.id ? item.origin.id : Math.random();
  
                    return(
                      <div styleName="list-item"
                           key={key}
                           onClick={() => this.onItemClick(item)} >
                        <div styleName="colorLabel" style={colorStyle}></div>
                        <div styleName="type">
                          {
                            title ?
                              <div styleName="name">{title}</div>
                            :
                              <div styleName="name untitled">Untitled</div>
                          }
                          <div styleName="description">{item.model.name}</div>
                        </div>
                        <div styleName="updated">{updatedStr}</div>
                        {
                          isEditable &&
                            <div styleName="hidden-controls">
                              <div styleName="hidden-remove" onClick={event => this.onRemoveClick(event, item)}>
                                <InlineSVG styleName="cross"
                                           src={require("assets/images/cross.svg")}/>
                              </div>
                            </div>
                        }
                      </div>
                    );
                  })
              }
            </div>
            {
              isEditable &&
                <div styleName="inputs-wrapper">
                  <div styleName="dropdown-wrapper">
                    <DropdownControl suggestionsList={models.map(m => m.name)}
                                     suggest={this.onChangeModel}
                                     current={this.state.currentModel.name} />
                  </div>
                  <div styleName="input-wrapper">
                    <InputControl placeholder="Create a new Content Record"
                                  value={this.state.itemTitle}
                                  icon="plus"
                                  onIconClick={this.onAddItem}
                                  onChange={this.onItemTitleChange}
                                  onKeyDown={this.onKeyDown} />
                  </div>
                </div>
            }
          </div>
        </div>
      </ContainerComponent>
    );
  }
}
