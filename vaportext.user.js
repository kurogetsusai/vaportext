// ==UserScript==
// @name        Vaportext
// @namespace   vaportext
// @description Adds a menu to transform text in any text inputs.
// @version     0.1.0
// @grant       none
// ==/UserScript==

'use strict';

const vaportext = {
	state: {
		elements: {
			container: null,
			menu: {
				container: null,
				items: []
			},
			style: null,
			context: null // selected text input / textarea element
		},
		menu: {
			items: [
				{
					label: 'UPPER CASE',
					action: text => text.toUpperCase()
				},
				{
					label: 'lower case',
					action: text => text.toLowerCase()
				},
				{
					label: 'S p a c e   l e t t e r s',
					action: text => text.split('').join(' ')
				},
				{
					label: 'Unspace letters',
					action: text => {
						let remove = false;

						return text.split('').map(char => {
							if (remove && char === ' ') {
								remove = false;
								return '';
							}

							remove = true;
							return char;
						}).join('');
					}
				},
				{
					label: 'esrever',
					action: text => text.split('').reverse().join('')
				},
				{
					label: '★ Black stars ★',
					action: text => vaportext.surroundString(text, '★')
				},
				{
					label: '☆ White stars ☆',
					action: text => vaportext.surroundString(text, '☆')
				},
				{
					label: 'nospaces',
					action: text => text.split(' ').join('')
				},
				{
					label: '[quote]text[/quote]',
					action: text => '[quote]' + text + '[/quote]'
				}
			]
		},
		triggerKey: 'F2'
	},

	surroundString(text, border, separator = ' ') {
		const trimmed = text.trim();

		return text.substring(0, text.indexOf(trimmed)) +
		       border + separator + trimmed + separator + border +
		       text.substring(text.indexOf(trimmed) + trimmed.length);
	},

	setupDOM() {
		const style = document.createElement('style');
		style.type = 'text/css';
		style.innerHTML = `
#vaportextContainer {
	position: fixed;
	top: 0;
	bottom: 0;
	left: 0;
	right: 0;
	z-index: 1000000;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: rgba(0, 0, 0, .1);
}

#vaportextMenu {
	padding: 10px;
	background-color: #ff0055;
}

.vaportextMenuItem {
	margin: 5px;
	padding: 10px 40px;
	background-color: #ffffcc;
	cursor: pointer;
}

.vaportextMenuItem pre {
	margin: 0;
	padding: 0;
	text-align: center;
	font-family: monospace;
	font-size: 1.2em;
	color: #409a9a;
}
`;
		document.getElementsByTagName('head')[0].appendChild(style);
		this.state.elements.style = style;

		const container = document.createElement('div');
		container.id = 'vaportextContainer';
		container.style.display = 'none';
		document.body.appendChild(container);
		this.state.elements.container = container;

		const menuContainer = document.createElement('div');
		menuContainer.id = 'vaportextMenu';
		container.appendChild(menuContainer);
		this.state.elements.menu.container = menuContainer;

		this.state.menu.items.forEach(item => {
			const menuItem = document.createElement('div');
			menuItem.className = 'vaportextMenuItem';
			menuItem.innerHTML = '<pre>' + item.label + '</pre>';
			menuItem.onclick = event => {
				const context = this.state.elements.context;
				const text = {
					all: context.value,
					before: context.value.substring(0, context.selectionStart),
					selection: context.value.substring(context.selectionStart, context.selectionEnd),
					after: context.value.substring(context.selectionEnd)
				};
				const selectionMode = text.selection.length !== 0;

				if (selectionMode) {
					text.selection = item.action(text.selection);
					context.value = text.before + text.selection + text.after;
				} else {
					context.value = item.action(text.all);
				}

				this.toggleMenu();
				context.focus();
				context.setSelectionRange(
					text.before.length,
					text.before.length + text.selection.length
				);
			};
			menuContainer.appendChild(menuItem);
			this.state.elements.menu.items.push(menuItem);
		});

		document.body.onkeypress = event => {
			if (event.key === this.state.triggerKey)
				switch (event.target.tagName) {
				case 'BODY':
					if (this.state.elements.container.style.display !== 'none')
						this.toggleMenu();
					break;
				case 'INPUT':
					if (event.target.type !== 'text')
						break;
					// fallthrough
				case 'TEXTAREA':
					this.toggleMenu(event.target);
				}
		};
	},

	toggleMenu(contextElement) {
		const container = this.state.elements.container;

		if (container.style.display === 'none')
			container.style.display = null;
		else
			container.style.display = 'none';

		if (contextElement instanceof Element)
			this.state.elements.context = contextElement;
	},

	main() {
		this.setupDOM();
	}
};

vaportext.main();
