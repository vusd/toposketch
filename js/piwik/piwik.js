
var time_started = Date.now();
var _paq = _paq || [];
/* tracker methods like "setCustomDimension" should be called before "trackPageView" */
_paq.push(['trackPageView']);
_paq.push(['enableLinkTracking']);

(
    function() 
    {
        var u="//toposketch.innocraft.cloud/";
        _paq.push(['setTrackerUrl', u+'piwik.php']);
        _paq.push(['setSiteId', '1']);
        var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
        g.type='text/javascript'; g.async=true; g.defer=true; g.src=u+'piwik.js'; s.parentNode.insertBefore(g,s);
    }
)();

function log_event(category, action, name, value)
{   console.log('Event ' + category + ', ' + action + ', ' + name + ', ' + value); 
    //_paq.push(['trackEvent', category, action, name, value]);
}

function log_toposketch_timestamp(action, name)
{   // Logs TopoSketch event with timestamp from when page was loaded (seconds)
    log_event('TopoSketch', action, name, (Date.now()-time_started)*0.001);
}

function log_toposketch_duration(action, name, duration_millis)
{   // Logs TopoSketch event with duration of action (seconds)
    log_event('TopoSketch', action, name, duration_millis*0.001);
}