import Vue from "vue"

const iptOnlyNum = Vue.directive('iptOnlyNum',{
	bind(el) {
		el.handler = function (event) {
			const invalidChars = ['-', '+', 'e', 'E']
			if(invalidChars.indexOf(event.key) !== -1){
				event.preventDefault()
			}
			el.value =el.value ? el.value.replace(/[^\d^\.]+/g,'').replace('.','$#$').replace(/\./g,'').replace('$#$','.') : '';
		};
		el.addEventListener('keypress', el.handler);
	},
	unbind(el) {
		el.removeEventListener('keypress', el.handler);
	}
})

export {iptOnlyNum}
