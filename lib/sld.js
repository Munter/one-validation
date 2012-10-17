/*global require*/

var fs = require('fs'),
    path = require('path'),
    punycode = require('punycode');

(function () {
    'use strict';

    var http = require('http'),
        options = {
            host: 'mxr.mozilla.org',
            path: '/mozilla-central/source/netwerk/dns/effective_tld_names.dat?raw=1',
            method: 'GET'
        },
        response = '',
        tlds = {};

    http.get(options, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            response += chunk;
        });
        res.on('end', function () {
            var rules = response.split('\n').filter(function (line) {
                return !/\/\//.test(line) && !/^\s*$/.test(line);
            });

            rules.filter(function (rule) {
                return rule.indexOf('.') === -1;
            }).forEach(function (rule) {
                tlds[rule.trim()] = {};
            });

            rules.filter(function (rule) {
                return rule.indexOf('.') > -1;
            }).forEach(function (rule) {
                var recurse = function (segments, hierarchy) {
                        var top = segments.pop().trim();

                        if (top.indexOf('!') === 0) {
                            hierarchy['*'].push(top.substring(1));
                        } else {
                            hierarchy[top] = hierarchy[top] || (top === '*' ? [] : {});
                        }

                        if (segments.length) {
                            recurse(segments, hierarchy[top]);
                        }
                    };
                recurse(rule.split('.'), tlds);
            });

            console.log(tlds);
/*
            rules.forEach(function (rule) {
                if (rule.indexOf)
            });
*/
        });
    });
}());

