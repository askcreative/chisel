import React from 'react';
import CSSModules from 'react-css-modules';
import ReactStars from 'react-stars';

import ContentBase from './ContentBase';
import InputControl from 'components/elements/InputControl/InputControl';

import * as ftps from 'models/ModelData';

import styles from '../ContentEdit.sss';


@CSSModules(styles, {allowMultiple: true})
export default class ContentNumber extends ContentBase {
  parseFunc = null;
  
  
  constructor(props) {
    super(props);
    
    this.parseFunc = this.field.type == ftps.FIELD_TYPE_INTEGER ? parseInt : parseFloat;
  }
  
  getDefaultValue() {
    if (this.field.isList)
      return [];
    return null;
  }
  
  getError () {
    let value = this.state.value;
    
    switch (this.field.type) {
      case ftps.FIELD_TYPE_FLOAT:
        switch (this.field.appearance) {
          case ftps.FIELD_APPEARANCE__FLOAT__DECIMAL:
            break;
        }
        break;
  
      case ftps.FIELD_TYPE_INTEGER:
        switch (this.field.appearance) {
          case ftps.FIELD_APPEARANCE__INTEGER__DECIMAL:
            if (this.field.isList) {
              for (let item of value) {
                if (Math.floor(item) != parseFloat(item))
                  return "You must type an integer value!";
              }
            } else {
              if (!value)
                value = 0;
              if (Math.floor(value) != parseFloat(value))
                return "You must type an integer value!";
            }
            
            break;
      
          case ftps.FIELD_APPEARANCE__INTEGER__RATING:
            break;
        }
        break;
    }
    
    return null;
  }
  
  onChange = (event, i) => {
    let value = event.target.value;
    
    if (this.field.isList) {
      let items = this.state.value;
      
      if (value)
        items[i] = value;
      else
        items.splice(i, 1);
      
      this.setState({value: items});
      
    } else {
      this.setState({value});
    }
  };
  
  onKeyDown = (event, i, inputs) => {
    event.stopPropagation();
  
    if (!this.field.isList)
      return;
    
    let code = event.keyCode;
    
    //Enter or down pressed
    if (code == 13 || code == 40) {
      if (inputs[i + 1]) {
        let items = this.state.value;
        let num = this.parseFunc(items[i]);
        if (!isNaN(num))
          inputs[i + 1].focus();
        else
          this.onBlur(i);
      }
      
      //up pressed
    } else if (code == 38) {
      if (i)
        inputs[--i].focus();
    }
  };
  
  onBlur = i => {
    if (this.field.isList) {
      let items = this.state.value;
      if (!items)
        return;
      
      let num = this.parseFunc(items[i]);
      if (!isNaN(num))
        items[i] = num;
      else
        items.splice(i, 1);
      
      this.setValue(items);
      
    } else {
      let str = this.state.value;
      this.setValue(this.parseFunc(str));
    }
  };
  
  onChangeRating = value => {
    value *= 2;
    this.setValue(value);
  };
  
  getInput() {
    let value = this.state.value;
    
    switch (this.field.type) {
      case ftps.FIELD_TYPE_FLOAT:
      case ftps.FIELD_TYPE_INTEGER:
        
        switch (this.field.appearance) {
          case ftps.FIELD_APPEARANCE__INTEGER__DECIMAL:
          case ftps.FIELD_APPEARANCE__FLOAT__DECIMAL:
            
            let inner;
        
            if (this.field.isList) {
              if (!value)
                value = [];
          
              inner = [];
              let inputs = [];
              for (let i = 0; i < value.length + 1; i++) {
                inner.push(<InputControl type="big"
                                            key={i}
                                            value={value[i]}
                                            readOnly={!this.isEditable}
                                            onChange={e => this.onChange(e, i)}
                                            DOMRef={inp => inputs[i] = inp}
                                            onBlur={e => this.onBlur(i)}
                                            onKeyDown={e => this.onKeyDown(e, i, inputs)} />);
              }
          
            } else {
              inner = <InputControl type="big"
                                       value={value}
                                       readOnly={!this.isEditable}
                                       onChange={this.onChange}
                                       onBlur={this.onBlur} />;
            }
        
            return (
              <div styleName="input-wrapper">
                {inner}
              </div>
            );
      
          case ftps.FIELD_APPEARANCE__INTEGER__RATING:
            value *= .5;
            return (
              <div styleName="input-wrapper">
                <ReactStars styleName="react-stars"
                            value={value}
                            onChange={this.onChangeRating}
                            size={32}
                            color1={'#F5F5F5'}
                            color2={'#5CA6DC'} />
              </div>
            );
        }
    }
  }
  
}
