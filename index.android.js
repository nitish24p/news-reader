'use strict;'

import React from 'react';

import {
  AppRegistry,
  StyleSheet,
  Navigator,
  BackAndroid
}  from 'react-native';

var NewsItems = require('./components/news-item');
var WebPage = require('./components/web-page');

var ROUTES = {
  news_item: NewsItems,
  web_page: WebPage 
}

var _navigator;
BackAndroid.addEventListener('hardwareBackPress', () => {
    if (_navigator && _navigator.getCurrentRoutes().length > 1) {
         _navigator.pop();
        return true;
    }
  return false;
});


var NewsReader = React.createClass({

  renderScene : function(route, navigator) {
    _navigator = navigator;
    var Component = ROUTES[route.name];
    return(
        <Component route={route} navigator={navigator} url={route.url}/>
      )
    },

    render: function() {
        return(
            <Navigator
                style={styles.container}
                initialRoute={{name: 'news_item', url: ''}}
                renderScene={this.renderScene}
                configureScreen={() => {return Navigator.SceneConfigs.HorizontalSwipeJumpFromRight;}}
            />
        );
    }

});

var styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
 
AppRegistry.registerComponent('NewsReader', () => NewsReader);
