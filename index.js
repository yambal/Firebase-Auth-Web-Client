var EventEmitter = require("events").EventEmitter;
var assign = require("object-assign");
var Dispatcher = require("flux").Dispatcher;
var dispatcher = new Dispatcher();

// Action
var Action = {
  googleLogin: function() {
    dispatcher.dispatch({
      actionType: "googleLogin",
      value: {}
    });
  },
  logOut : function(){
    dispatcher.dispatch({
      actionType: "logOut",
      value: {}
    });
  }
};

// Store
let state = {
  isLogined :false,
  idToken:null,
  user:null
};

const EVENT = {
  ON_STATE_CHANGED : 'on_state_changed'
}

var Store = assign({}, EventEmitter.prototype, {
  addOnStateChangedLister: function(callback) {
    this.on(EVENT.ON_STATE_CHANGED, callback);
  },
  emitOnStateChanged: function() {
    this.emit(EVENT.ON_STATE_CHANGED, state.isLogined);
  },
  //
  onAuthStateChanged: function(user, idToken) {
    if(user && idToken){
      state.isLogined = true;
      state.idToken = idToken;
      state.user = user;
    }else{
      state.isLogined = false;
      state.idToken = null;
      state.user = null;
    }
    Store.emitOnStateChanged();
  },
  //
  dispatcherIndex: dispatcher.register(function(payload) {
    switch (payload.actionType) {
      case 'googleLogin':
        var provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
        firebase.auth().useDeviceLanguage();
        firebase.auth().signInWithRedirect(provider);
        break;
      case 'logOut':
        console.log('logOut');
        firebase.auth().signOut();
        break;
    }
  })
});



firebase.auth().onAuthStateChanged(function(user) {
  console.log('onAuthStateChanged', user);
  if (user) {
    firebase
      .auth()
      .currentUser.getIdToken(true)
      .then(function(idToken) {
        Store.onAuthStateChanged(user, idToken);
      })
      .catch(function(error) {
        // Handle error
      });
  }else{
    Store.onAuthStateChanged(null, null);
  }
});

module.exports = {
  Action: Action,
  Store: Store
};