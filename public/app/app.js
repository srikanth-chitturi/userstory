angular.module('myApp', ['appRoutes', 'MainCtrl', 'authService', 'userCtrl', 'userService', 'storyService', 'storyCtrl','reverseDirective'])
	.config(function($httpProvider) {
		$httpProvider.interceptors.push('AuthInterceptor');
	});