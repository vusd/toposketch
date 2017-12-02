
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
{   //console.log(category + ', ' + action + ', ' + name + ', ' + value); 
    _paq.push(['trackEvent', category, action, name, value]);
}

// Setup to log last path and grid session info before unloading window
window.onunload = function()
{   
    if(animation.data != null)
    {
        animation.data.path_session_end();
        animation.data.path_session_end();   
    }
}

