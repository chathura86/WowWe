/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    initialize: function() {
        this.bind();
    },
    bind: function() {
        document.addEventListener('deviceready', this.deviceready, false);
    },
    deviceready: function() {
        //load cities from the API
		page.init();
		page.show('page-city-list');
    },
    report: function(id) {
        // Report the event in the console
        console.log("Report: " + id);

        // Toggle the state from "pending" to "complete" for the reported ID.
        // Accomplished by adding .hide to the pending element and removing
        // .hide from the complete element.
        document.querySelector('#' + id + ' .pending').className += ' hide';
        var completeElem = document.querySelector('#' + id + ' .complete');
        completeElem.className = completeElem.className.split('hide').join('');
    }
};

var page = {
	stack: [],
	current: 'page-loading',
	currentParam: 0,
	init: function () {
		var prevButtons = document.querySelectorAll('.prev_button');
//		var nextButtons = document.querySelectorAll('.next_button');
		

		for(var i = 0; i < prevButtons.length; i++) {
			prevButtons[i].addEventListener('click', function () {
				if (page.stack.length > 0) {
					var obj = page.stack.pop();
					page.show(obj.page, obj.param, true);
				}
				return false;
			});
		}
	},
	show: function (target, param, ignore) {
		param = param || 0;
		ignore = ignore || false;
		
		//add to stack
		if (!ignore){
			page.stack.push({page: page.current, param: page.currentParam});
		}
		
		document.querySelector('#' + page.current).style.display = 'none';
		document.querySelector('#' + target).style.display = 'block';
		
		page.current = target;
		page.currentParam = param;
		
		switch (target) {
			case 'page-city-list':
				page.cityList();
				break;
			case 'page-service-list':
				page.serviceList(param);
				break;
			case 'page-service-details':
				page.serviceDetails(param);
				break;
		}
	},
	cityList: function () {
		var loadingDiv = document.querySelector('#' + page.current + ' .loading');
		var dataDiv = document.querySelector('#' + page.current + ' ul');
		
		dataDiv.style.opacity = '0';
		loadingDiv.style.height = '300px';
		
		api.get('arealist/?', function (data) { 
			loadingDiv.style.height = '0';
			dataDiv.style.opacity = '0';
			dataDiv.innerHTML = '';
			
			for (var i in data.Areas){
				var li = document.createElement('li');
				li.innerHTML = '<div class="map-area" data-title="' + data.Areas[i].Name + '"><a href="#" data-id="' + data.Areas[i].AreaId + '"><strong>' + (parseInt(i)+1) + ' :</strong> ' + data.Areas[i].Name + '</a></div>';
				
				li.querySelector('a').addEventListener('click', function () {
					var cityID = this.getAttribute('data-id');
					
					page.show('page-service-list', cityID);
					
					return false;
				}, false);
				
				dataDiv.appendChild(li);
			}
			
			dataDiv.style.opacity = '1';
		});
	},
	serviceList: function (city) {
		var loadingDiv = document.querySelector('#' + page.current + ' .loading');
		var dataDiv = document.querySelector('#' + page.current + ' ul');
		
		dataDiv.style.opacity = '0';
		loadingDiv.style.height = '300px';
		
		api.get('serviceslist/?id=' + city + '&', function (data) { 
			loadingDiv.style.height = '0';
			dataDiv.style.opacity = '0';
			dataDiv.innerHTML = '';
			
			for (var i in data.Services){
				var li = document.createElement('li');
				li.innerHTML = '<div class="map-area" data-title="' + data.Services[i].Name + '"><a href="#" data-id="' + data.Services[i].ServiceId + '"><strong>' + (parseInt(i)+1) + ' :</strong> ' + data.Services[i].Name + '</a></div>';
				
				li.querySelector('a').addEventListener('click', function () {
					var serviceID = this.getAttribute('data-id');
					
					page.show('page-service-details', serviceID);
					
					return false;
				}, false);
				
				dataDiv.appendChild(li);
			}
			
			dataDiv.style.opacity = '1';
		});
	},
	serviceDetails: function (service) {
		var loadingDiv = document.querySelector('#' + page.current + ' .loading');
		var dataDiv = document.querySelector('#' + page.current + ' .content-area');
		
		dataDiv.style.opacity = '0';
		dataDiv.querySelector('.service-data-image').src = '';
		dataDiv.querySelector('.services_heading').innerHTML = '';
		dataDiv.querySelector('.service_details').innerHTML = '';
		
		loadingDiv.style.height = '300px';
		
		api.get('service/?id=' + service + '&', function (data) { 
			loadingDiv.style.height = '0';
			dataDiv.style.opacity = '0';

			dataDiv.querySelector('.service-data-image').src = 'http://wowwe.com.au/images/uploaded/' + data.Service.LogoPath;
			dataDiv.querySelector('.services_heading').innerHTML = data.Service.Name;
			
			var html = '<h1 class="main_heading">Bonus ' + data.Service.Bonus + '<br />Save ' + data.Service.Save + '</h1><div>' + data.Service.Description + '</div>';
			
			dataDiv.querySelector('.service_details').innerHTML = html;
			
			dataDiv.style.opacity = '1';
		});
	}
}

var api = {
	path: 'http://wowwe.com.au/api/',
	get: function (res, process) {
		window.jpRes = function (data) {
			process(data);
		}
		var script = document.createElement('script');
		script.src = api.path + res + 'callback=jpRes';
		document.body.appendChild(script);
	}
}

//use on webbrowser
setTimeout(function () {
	app.deviceready();
}, 500);