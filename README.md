# HTML-Custom-Controls
A suite of custom elements for html that control a state variable.

=============WIP============


For a preview, look at my under construction site https://lkao.hopto.org/particles.html

Elements added:
* button-control
* colour-control
* slider-control
* control-set
* collapsible-set
* radio-set


```html
<script type="module" src="CustomControlElements.mjs"></script>
<collapsible-set displayname="Bam WOW">
  <link slot="style" rel="stylesheet" href="CustomControlElements.css" type="text/css"> <!-- Optinal styling -->
	<colour-control name="#YOLO SWAG "></colour-control>
	<slider-control name="Slippy Slider Yo " tickinterval="10"></slider-control>
	<button-control name="Big Boppy Button "></button-control>
</collapsible-set>
```

Yields:

![Preview](/CodePreview.png)



The controls also combine into a singular object for querying values:

```js
var values = document.querySelector('*[name="Generation"]').value;
values.Lifespan.lifeSpanMean  // = 1000
values.spawnRate // = 4
values.spawnRate = 2 //Sets the slider's value to 2.