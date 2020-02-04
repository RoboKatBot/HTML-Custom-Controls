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
<collapsible-set name="Generation">
		<collapsible-set name="Position">
			<radio-set selected="Radial">
				<control-set name="Cartesian">
					<!-- Controls.MaxMinSlidername="x" min=-1 max=1 value=-0.5 0.5 step=0.1 split=1 	tickInterval=0.1  -->
					<!-- Controls.MaxMinSlidername="y" min=-1 max=1 value=-0.5 0.5 step=0.1 split=1 	tickInterval=0.1 -->
				</control-set>
				<control-set name="Radial">
					<slider-control name="radiusMean" 	displayName="Radius Mean"	 min=0 	max=1.5 value=1.5 	step=0.1 	tickInterval=0.2 	title="Average distance between newly spawned particle and the origin."></slider-control>
					<slider-control name="radiusRange" displayName="Radius Range"	 min=0 	max=1 	value=0 	step=0.1 	tickInterval=0.1></slider-control>
					<slider-control name="thetaMean" 	displayName="θ Mean"		 min=0 	max=180 value=84.6 	step=1 	tickInterval=45 	title="Average angle between each newly spawned particle in degrees."></slider-control>
					<!-- Controls.Checkboxname="thetaDir"  displayName="direction"  value=true  -->
					<slider-control name="thetaRange" 	displayName="θ Range"		 min=0 	max=90 	value=0 	step=1 	tickInterval=22.5></slider-control>
				</control-set>
				</radio-set>
		</collapsible-set>
		<collapsible-set name="Lifespan">
			<slider-control name="lifespanMean" 	displayName="Lifespan frames" min=0 	max=1000 	value=1000 	step=20 tickInterval=100 	title="Average number of frames the particles will live for."></slider-control>
			<slider-control name="lifespanRange" 	displayName="Lifespan Range"	 min=0 	max=100 	value=0 	step=1 	tickInterval=10></slider-control>
		</collapsible-set>
		<slider-control name="spawnRate" 		displayName="Genesis Rate"	 min=0 	max=5 	value=4 	step=0.1 	tickInterval=1 	title="Rate at which particles are initaly generated.\nChanges have no affect once all particles are spawned in."></slider-control>
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