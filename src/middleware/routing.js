import {browserHistory} from 'react-router';
import {LOCATION_CHANGE} from 'react-router-redux';

import {LOGIN_RESPONSE, REGISTER_RESPONSE, LOGOUT} from 'ducks/user';
import {setCurrentSite} from 'ducks/models';
import {getSiteByNameId} from 'utils/data';
import {INIT_END, SIGN_URL, SITE_URL, USERSPACE_URL, EMAIL_URLS, PROFILE_URL} from 'ducks/nav';


let URL = '/';
let nonAuthURL = null;


let getNameId = (path, type) => {
  let ind = path.indexOf(type);
  if (ind == -1)
    return null;
  
  let nameId = path.slice(ind).slice(type.length);
  let ind2 = nameId.indexOf('/');
  if (ind2 > 0)
    nameId = nameId.slice(0, ind2);
  return nameId;
};

let isEmailURL = URL => {
  for (let eURL of EMAIL_URLS) {
    if (URL.indexOf(eURL) != -1)
      return true;
  }
  return false;
};

export const routing = store => next => action => {
  if (action.type == REGISTER_RESPONSE || action.type == LOGIN_RESPONSE) {
    if (!action.authorized && !isEmailURL(URL) && URL.indexOf(SIGN_URL) == -1)
      browserHistory.push(`/${SIGN_URL}`);
  }
  
  next(action);
  
  let setFromURL = () => {
    let path = URL;
    URL = '/';
    
    if (path.indexOf(USERSPACE_URL) == -1)
      return;
  
    let cSite = store.getState().models.currentSite;
    let setDefaultSite = () => {
      if (cSite) {
        browserHistory.replace(`/${USERSPACE_URL}/${SITE_URL}${cSite.nameId}`);
      } else {
        let sites = store.getState().models.sites;
        if (sites.length)
          browserHistory.replace(`/${USERSPACE_URL}/${SITE_URL}${sites[0].nameId}`);
        else if (path != `/${USERSPACE_URL}`)
          browserHistory.replace(`/${USERSPACE_URL}`);
      }
    };
    
    //set current site
    let nameId = getNameId(path, SITE_URL);
    if (nameId) {
      if (!cSite || nameId != cSite.nameId) {
        let site = getSiteByNameId(nameId);
        if (site)
          next(setCurrentSite(site));
        else
          setDefaultSite();
      }
      
    } else if (path.indexOf(PROFILE_URL) == -1) {
      setDefaultSite();
    }
  };
  
  if (action.type == LOCATION_CHANGE) {
    URL = action.payload.pathname;
    
    if (URL.indexOf(USERSPACE_URL) != -1 && !nonAuthURL)
      nonAuthURL = URL;
  
    if (store.getState().nav.initEnded)
      setFromURL();
  }
  
  if (action.type == INIT_END) {
    if (nonAuthURL) {
      URL = nonAuthURL;
      nonAuthURL = null;
      browserHistory.replace(URL);
    } else if (URL.indexOf(USERSPACE_URL) == -1 && !isEmailURL(URL)) {
      browserHistory.replace(`/${USERSPACE_URL}`);
    }
    
    setFromURL();
  }
  
  if (action.type == LOGOUT)
    browserHistory.push(`/${SIGN_URL}`);
};
