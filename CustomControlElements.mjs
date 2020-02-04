// var script = document.querySelector('script[src$="CustomControlElements.mjs"]');
// if (!script)
// 	script = document.head;


import {mean, sum} from '/mathUtilities.mjs'

function getHeight(elem) {
	const style = getComputedStyle(elem);
	const extra = sum(["marginTop","marginBottom","paddingTop","paddingBottom","borderTopWidth","borderBottomWidth"].map(f=>parseInt(style[f].replace('px',''))));
	return (elem.height || elem.offsetHeight) + extra;
}

function modifiedEvent(elem) { //Look into way to reduce the number of calls to this being made. i.e. remove duplicate events.
	elem.dispatchEvent(new CustomEvent('modification', {bubbles:true}))
}


//Control is the base abstract class for all elements here.
//name = internal name used for retrieving element values and such.
//displayname = name displayed on page for element, does not show a name for all elements
//title = mouseover title text.
//styles = Array of style or link rel="stylesheet" elems that apply their styles to this element and (by default) to all child elements. Not an attribute.
//noinherit = boolean of whether to inherit styles or not.



const styleTemplate = document.createElement('template');
styleTemplate.innerHTML = `
	<slot name="style"></slot>
	<div class="styles"></div> 
` //styles are cloned from the slot to the div.styles after being attached.

class Control extends HTMLElement {
	constructor(params, elems) { //{name, displayname, title, styles, noinherit}
		super();
		this.attachShadow({mode: 'open'});
		const frag = styleTemplate.content.cloneNode(true);
		const stylesSlot = frag.firstElementChild;
		this.stylesDiv = frag.lastElementChild;
		this.shadowRoot.append(stylesSlot, this.stylesDiv);
		stylesSlot.addEventListener('slotchange', ()=>{
			if (stylesSlot.assignedNodes().length)
				this.styles = stylesSlot.assignedNodes();
		});
		if (elems)
			this.shadowRoot.append(...Object.values(elems));
		Object.assign(this, elems, params);
		for (var attrib of this.attributes) {
			this[attrib.localName] = attrib.value;
		}
	}
	static get observedAttributes() {
		return ['name', 'displayname', 'noinherit'];
	}
	get displayname() {
		return this.getAttribute('displayname');
	}
	set displayname(val) {
		this.setAttribute('displayname', val);
		if (!this.title) 
			this.title = val;
	}
	get name() {
		return this.getAttribute('name');
	}
	set name(val) {
		this.setAttribute('name', val);
		if (!this.displayname) 
			this.displayname = val;
	}
	get noinherit() {
		return this.getAttribute('noinherit');
	}
	set noinherit(val) {
		this.setAttribute('name', val)
	}
	get styles() {
		return this.stylesDiv.children;
		// return this.querySelectorAll('style, link[rel="stylesheet"]');
	}
	set styles(val) {
		if (!(val instanceof Array || val instanceof HTMLCollection || val instanceof NodeList))
			val = [val];
		for (var style of this.styles) //Maybe change so that if style in val, don't remove? Is there and performance benefit?
			style.remove();
		for (var style of val) {
			this.stylesDiv.append(style.cloneNode(true));
		}
		this.redraw?.();
	}
	attributeChangedCallback(name, oldValue, newValue) {
		if (this[name] !== newValue /*&& oldValue !== newValue*/)
			this[name] = newValue;
	}
	get stylesWaiting() {
		const a = inheritableSlotStyles(this);
		const b = this.stylesDiv.children;
		for (var i = 0; i < Math.max(a.length,b.length); i++) {
			if (a[i]?.outerHTML!==b[i]?.outerHTML)
				return true;
		}
		return false;
		function inheritableSlotStyles(elem) {
			const parentSlotStyles = (elem.parentElement.tagName.match(/-SET$/) && !elem.noinherit) //'elem.parentElement instanceof Control' would not work here unless somehow all custom elements could be registered before any are initalized. IDK if this is possible.
				? inheritableSlotStyles(elem.parentElement)
				: [];
			return [...elem.children].filter(f=>f.slot==="style");
		}
	}
}



class button_control extends Control { //{name, displayname, title, styles, noinherit}
	constructor(params) {
		const label = document.createTextNode('');
		super({label, ...params});
		this.shadowRoot.append(label);

		this.addEventListener('mousedown',()=>{
			this.value = 1;
		});
		this.addEventListener('mouseup',()=>{
			this.value = 0;
		});
	}
	get displayname() {return super.displayname}
	set displayname(val) {
		this.label.nodeValue = val;
		super.displayname = val;
	}
}



//value = initial value (must be valid colour range value, i.e. "#00ff00" for green.)

const colourTemplate = document.createElement('template');
colourTemplate.innerHTML = `
	<label>
		<input type="color">
	</label>
`

class colour_control extends Control { //{name, displayname, title, styles, noinherit, value}
	constructor(params) {
		const label = colourTemplate.content.cloneNode(true).firstElementChild;
		const input = label.firstElementChild;
		super(params, {label, input});
	}
	static get observedAttributes() {
		return ['name', 'displayname', 'noinherit', 'value'];
	}
	get value() {
		return this.input.value;
	}
	set value(x) {
		this.input.value = x;
	}
	get displayname() {return super.displayname}
	set displayname(x) {
		this.label.childNodes[0].nodeValue = x;
		super.displayname = x;
	}
}



//value = initial value.
//min = minimum value for slider (note, this does not prevent the numerical input from exceeding these bounds, this is by design.)
//min = maximum value for slider (note, this does not prevent the numerical input from exceeding these bounds, this is by design.)
//step = step for slider
//tickinterval = determines the distance between tick markings on slider if present.

const sliderTemplate = document.createElement('template');
sliderTemplate.innerHTML = `
	<label class="slider"> </label>
	<input type="range" class="slider">
	<input type="number" step="any" class="slider">
`

class slider_control extends Control { //{name, displayname, title, styles, noinherit, min, max, step, value, tickinterval}
	constructor(params, cb) {
		const frag = sliderTemplate.content.cloneNode(true)
		const label = frag.children[0];
		const slider = frag.children[1];
		const sliderValue = frag.children[2];
		super({cb, slider, sliderValue, label, ...params});
		this.shadowRoot.append(frag);
		// this.shadowRoot.append(label);

		const update = (e) => {
			this.value = e.target.value;
		}
		slider.addEventListener('input',update);
		sliderValue.addEventListener('input',update);
	}
	static get observedAttributes() {
		return ['name', 'displayname', 'noinherit', 'min', 'max', 'value', 'step', 'tickinterval'];
	}
	get min() {return this._min||0}
	set min(x)		{
		this._min		= x;
		this.slider.min	= x;
		this.sliderValidity();
		this.drawTicks();
	}
	get max() {return this._max||100}
 	set max(x)		{
 		this._max		= x;
		this.slider.max	= x;
		this.sliderValidity();
		this.drawTicks();
	}
	get step() {return this._step||1}
	set step(x)		{
		this._step		= x;
		this.slider.step= x;
	}
	get displayname() {return super.displayname}
	set displayname(x)		{
		super.displayname	= x;
		this.label.childNodes[0].nodeValue	= `${x}:`;
		this.label.htmlFor	= `${x}Input`;
		this.sliderValue.id	= `${x}Input`;
	}
	get value() {
		return this._value;
	}
	set value(x)	{
		const y = parseFloat(x);
		if(isNaN(y)) return;
		this._value = y;
		this.slider.value = y;
		if(y!==parseFloat(this.sliderValue.value) || this.sliderValue.value === "")
			this.sliderValue.value = y;
		this.sliderValidity();
		if (this.cb&&this.attached) this.cb(this);
	}
	get tickinterval() {return this._tickinterval}
	set tickinterval(val) {
		this._tickinterval = val;
		this.drawTicks();
	}
	connectedCallback() {
		this.attached = true;
		this.drawTicks();
	}
	sliderValidity() {
		if(this.value < this.min || this.value > this.max)
			this.slider.setCustomValidity('Out of range');
		else this.slider.setCustomValidity('');
	}
	drawTicks() {
		if (!this.tickinterval || !this.attached || this.stylesWaiting) return;
		this.shadowRoot.querySelectorAll('.Tick').forEach(f=>f.remove());
		const range = this.max - this.min
		if (!range) return;
		const freq = 1 / this.tickinterval;
		const start = freq * (Math.ceil(this.min) - this.min);
		const count = range * freq;
		const dist = (this.slider.clientWidth - 12) / count;
		for (var i = start; i <= count; i++) {
			const tick = document.createElement("div");
			tick.classList.add('Tick');
			tick.style.left = CSS.px(i * dist + this.slider.offsetLeft + 6);
			this.shadowRoot.append(tick);
		}
	}
	redraw() {
		this.drawTicks();
	}
}

class control_set extends Control {
	constructor(params, elems) { //{name, displayname, title, styles, noinherit}
		super(params, elems);
		if (this.constructor.name==='control_set')
			this.shadowRoot.append(document.createElement('slot'));
		this.addEventListener('modification', this.resize);
	}
	get styles() {return super.styles}
	set styles(val) {
		super.styles = val;
		for (var control of this.children) {
			if (control instanceof Control && !control.noinherit)
				control.styles = this.styles;
		}
	}
	get value() {
		const ret = {};
		for (var control of this.children) {
			if (!(control instanceof Control)) continue;
			const set = control instanceof control_set;
			if (control.name) 
				ret[control.name] = control;
			else {
				if (!set)
					throw "All base controls must have a name."
				Object.assign(ret, control);
			}
		}

		return new Proxy(ret,{
			get: (obj, prop)=>{
				return obj[prop].value;
			},
			set: (obj, prop, val)=>{
				obj[prop].value = val;
			}
		});

	}
	get height() {
		return [...this.children].reduce((a,b)=>a+getHeight(b),0) +
			[...this.shadowRoot.children].reduce((a,b)=>a+getHeight(b),0);
	}
	resize(toggle) {
		return this.style.height = CSS.px(this.height);
		modifiedEvent(this.parentElement);
	}
	connectedCallback() {
		if (!this.stylesWaiting) {
			setTimeout(this.resize.bind(this));//Lazy fix - Gets called twice if there are styles to load.	
		}
	}
	redraw() {
		this.resize();
	}
}



//hidden = whether the collapsible-set element is collapsed by default.

const collapsibleTemplate = document.createElement('template');
collapsibleTemplate.innerHTML = `
<h3>
	<svg class="downArrow">
		<path fill="#fff" d="M 0 1 L 1 0 L 6 4 L 11 0 L 12 1 L 6 6 Z"></path>
	</svg>
</h3>
<slot></slot>
`

class collapsible_set extends control_set {
	constructor(params) { //{name, displayname, title, styles, noinherit, hidden}
		const frag = collapsibleTemplate.content.cloneNode(true);
		const button = frag.firstElementChild;
		super({button, ...params}, {frag});
		// this.shadowRoot.append(frag);
		if (this.classList.contains('hidden'))
			this.hidden = 1;

		button.addEventListener('click', this.resize.bind(this, 1));
	}
	static get observedAttributes() {
		return ['name', 'displayname', 'noinherit', 'hidden'];
	}
	get displayname() {return super.displayname}
	set displayname(val) {
		this.button.childNodes[0].nodeValue = val;
		super.displayname = val;
	}
	get hidden() {
		return this.classList.contains('hidden');
	}
	set hidden(val) {
		this.classList.toggle('hidden', val);
		this.setAttribute('tabindex', -val);
		this.setAttribute('aria-disabled', val);
		resize();
	}
	get height() {
		return	this.classList.contains("hidden")
			? this.button.scrollHeight
			: super.height;
	}
	resize(toggle) {
		if (toggle)
			this.classList.toggle('hidden');
		super.resize();
	}
}



//selected = initial/current radio selected.

const radioTemplate = document.createElement('template');
radioTemplate.innerHTML = `
<label>
	<input type="radio">
</label>
`

class radio_set extends control_set { //Each child control must be named.
	constructor(params) { //{name, displayname, title, styles, noinherit, selected}
		super(params);
		const name = this.name || Math.random().toString(); //Unique name to tie radios together.
		const radios = [];
		for (var control of this.children) {
			if(!(control instanceof Control)) continue;
			const label = radioTemplate.content.cloneNode(true);
			const radio = label.firstElementChild;
			radios.push[label];
			label.childNodes[0].nodeValue = this.displayName;
			radio.type = "radio"
			radio.name = name;
			radio.id = control.name;
			if(control.name===init)
				radio.checked = true;
			else
				control.elem.style.display = 'none';
			radio.addEventListener('input',()=>{
				this.selected = control.name;
			});
		}
		this.prepend(radios);

		new MutationObserver((Mut)=>{ //change radio name upon child control displayName changing.
			if ([...this.children].includes(Mut.target) && Mut.type==="attributes" && Mut.target instanceof Control && Mut.attributeName ==="displayname")
				radios.filter(r=>r.name===Mut.target.oldValue)[0].childNodes[0].nodeValue = Mut.target.displayname;
		}).observe(this, {attributes:true, childList:true});
	}
	static get observedAttributes() {
		return ['name', 'displayname', 'noinherit', 'selected'];
	}
	get selected() {
		return this.getAttribute('selected');
	}
	set selected(val) {
		this.setAttribute('selected', val);
		for (var control of this.children) {
			if (!(control instanceof Control)) return;
			if(control.name===val)
				control.style.display = '';
			else
				control.style.display = 'none';
		}
		modifiedEvent(this);
	}
}





//Register classes as custom elements, and export an optionally usable object with methods to create and populate these elements. 

export default Object.fromEntries(
	[radio_set,collapsible_set, control_set, button_control, colour_control, slider_control]
		.map(Class=>{
		const elemName = Class.name.replace('_', '-');
		customElements.define(elemName, Class);
		console.log(`Custom element: ${elemName} registered`);



		return [Class.name, (params)=>{
			const el = document.createElement(elemName);
			Object.assign(el, params);
			return el;
		}]
	})
)