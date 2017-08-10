## TopoSketch App Events

Piwik [logs events](https://piwik.org/docs/event-tracking/) using the following format `[Category, Action, Name, Value]`. 

| Category      | Action     | Name                    | Value                       | Event Trigger 
| ------------- | -----------|------------------------ | --------------------------- | -----
| **Recording** | Scrub      | `[current grid image]`  | `[duration in ms]`          | When the mouse is over the grid area, but not drawing
|               | Draw       | `[current grid image]`  | `[duration in ms]`          | After the mouse is done drawing over the grid area         
| **Paths**     | Session    | `[current loaded path]` | `[duration in ms]`          | When an example/loaded path is changed 
| **Grids**     | Session    | `[current grid image]`  | `[duration in ms]`          | When an example/loaded grid is changed 
| **Render**    | Start      | `[rendered grid image]` | `[# of frames]`             | When a render is started
|               | Abort      | `[rendered grid image]` | `[time waited in ms]`       | When a render is cancelled
|               | Complete   | `[rendered grid image]` | `[time taken in ms]`        | When a render is finished
|               | Complete   | `[rendered grid image]` | `[time taken in ms]`        | When a render is finished
|               | Download   |                         |                             | When a rendered image is downloaded using "download" button
|               | Popout     |                         |                             | When a rendered image is opened using "popout" button
| **UI**        | Playback   | Play                    |                             | When the "play" button is pressed
|               | Playback   | Pause                   |                             | When the "pause" button is pressed
|               | Path       | Next                    |                             | When "next example path" button is pressed
|               | Path       | Prev                    |                             | When "previous example path" button is pressed
|               | Path       | Clear                   |                             | When "clear path" button is pressed
|               | Path       | Add Success             |                             | When "add path" button is pressed and a valid .json file is loaded
|               | Path       | Add Fail                |                             | When "add path" button is pressed and an invalid .json file is provided
|               | Grid       | Next                    |                             | When "next example grid" button is pressed
|               | Grid       | Prev                    |                             | When "previous example grid" button is pressed
|               | Grid       | Add Success             |                             | When "add grid" button is pressed and a valid image file is loaded
|               | Grid       | Add Fail                |                             | When "add grid" button is pressed and an invalid image file is provided

## Webpage Events

These are mostly handled automatically by Piwik:
* Slides (via [outlinks](https://piwik.org/faq/new-to-piwik/faq_71/))
* Github (via outlinks)
* TopoSketch Video Stats ([via media analytics](https://developer.piwik.org/guides/media-analytics/setup))
* Image downloads (via <https://piwik.org/faq/new-to-piwik/faq_47/>)