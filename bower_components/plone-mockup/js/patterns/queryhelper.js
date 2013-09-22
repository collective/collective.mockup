// Pattern which Plone livesearch functionality on an input
//
// Author: Nathan Van Gheem
// Contact: nathan@vangheem.us
// Version: 1.0
//
// Adapted from queryhelper.js in Plone.
//
// License:
//
// Copyright (C) 2013 Plone Foundation
//
// This program is free software; you can redistribute it and/or modify it
// under the terms of the GNU General Public License as published by the Free
// Software Foundation; either version 2 of the License.
//
// This program is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
// FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
// more details.
//
// You should have received a copy of the GNU General Public License along with
// this program; if not, write to the Free Software Foundation, Inc., 51
// Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
//


define([
  'jquery',
  'mockup-patterns-base'
], function($, Base) {
  "use strict";

  var QueryHelper = Base.extend({
    name: "queryhelper",
    defaults: {
      basePattern: null, // must be passed in
      ajaxvocabulary: null,
      searchParam: 'SearchableText', // query string param to pass to search url
      attributes: ['UID','Title', 'Description', 'getURL', 'Type'],
      batchSize: 10, // number of results to retrive
      baseCriteria: []
    },

    init: function() {
      /* if basePattern argument provided, it can implement the interface of:
       *    - browsing: boolean if currently browsing
       *    - currentPath: string of current path to apply to search if browsing
       *    - basePath: default path to provide if no subpath used
       */
      var self = this;
      self.basePattern = self.options.basePattern;
      if(self.basePattern === undefined){
        self.basePattern = {
          browsing: false
        };
      }

      if (self.options.url && !self.options.ajaxvocabulary) {
        self.options.ajaxvocabulary = self.options.url;
      }
      if(self.options.ajaxvocabulary !== undefined &&
          self.options.ajaxvocabulary !== null){
        self.valid = true;
      }else{
        self.valid = false;
      }
    },

    selectAjax: function(){
      var self = this;
      return {
        url: self.options.ajaxvocabulary,
        dataType: 'JSON',
        quietMillis: 100,
        data: function(term, page) {
          if(term){
            term += '*';
          }
          var criteria = self.options.baseCriteria.slice(0);
          criteria.push({
            i: self.options.searchParam,
            o: 'plone.app.querystring.operation.string.contains',
            v: term
          });
          var pattern = self.basePattern;
          if(pattern.browsing){
            criteria.push({
              i: 'path',
              o: 'plone.app.querystring.operation.string.path',
              v: pattern.currentPath ? pattern.currentPath : pattern.options.basePath
            });
          }

          var opts = {
            query: JSON.stringify({
              criteria: criteria
            }),
            batch: JSON.stringify({
              page: page, // select2 is 1 based for pages
              size: self.options.batchSize
            }),
            attributes: JSON.stringify(self.options.attributes)
          };
          return opts;
        },
        results: function (data, page) {
          var more = (page * 10) < data.total; // whether or not there are more results available
          // notice we return the value of more so Select2 knows if more results can be loaded
          return {results: data.results, more: more};
        }
      };
    },

    search: function(term, operation, value, callback, useBaseCriteria){
      if(useBaseCriteria === undefined){
        useBaseCriteria = true;
      }
      var self = this;
      var criteria = [];
      if(useBaseCriteria){
        criteria = self.options.baseCriteria.slice(0);
      }
      criteria.push({
        i: term,
        o: operation,
        v: value
      });
      var data = {
        query: JSON.stringify({ criteria: criteria }),
        attributes: JSON.stringify(self.options.attributes)
      };
      $.ajax({
        url: self.options.ajaxvocabulary,
        dataType: 'JSON',
        data: data,
        success: callback
      });
    }
  });

  return QueryHelper;

});

