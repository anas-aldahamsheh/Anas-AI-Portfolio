/**
 * Runs before first paint:
 *  1. applies the saved theme (no light/dark flash);
 *  2. enables scroll reveals only when JS is alive and motion is allowed — content is never
 *     hidden for crawlers, failed scripts, or visitors who prefer reduced motion;
 *  3. turns on the admin edit outline if the owner left edit mode on.
 * Uses attributes (not classes) on React-rendered nodes, so hydration never sees a mismatch.
 */
const SCRIPT = `(function(){try{
var d=document.documentElement;
var m=document.cookie.match(/(?:^|; )pf_theme=([^;]+)/),t=m?m[1]:null;
try{if(!t)t=localStorage.getItem('pf_theme');}catch(e){}
var dark=t==='dark'||((!t||t==='system')&&matchMedia('(prefers-color-scheme: dark)').matches);
d.classList.toggle('dark',dark);d.style.colorScheme=dark?'dark':'light';
try{if(/(?:^|; )pf_admin=1/.test(document.cookie)&&localStorage.getItem('pf_edit')==='1')d.classList.add('edit-mode');}catch(e){}
if(matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window))return;
d.classList.add('reveal-ready');
var io=new IntersectionObserver(function(es){for(var i=0;i<es.length;i++){var e=es[i];if(e.isIntersecting){e.target.setAttribute('data-shown','');io.unobserve(e.target);}}},{rootMargin:'0px 0px -6% 0px',threshold:0.06});
function add(n){if(n.nodeType!==1)return;if(n.hasAttribute('data-reveal'))io.observe(n);var l=n.querySelectorAll('[data-reveal]');for(var i=0;i<l.length;i++)io.observe(l[i]);}
new MutationObserver(function(rs){for(var i=0;i<rs.length;i++){var a=rs[i].addedNodes;for(var j=0;j<a.length;j++)add(a[j]);}}).observe(d,{childList:true,subtree:true});
setTimeout(function(){var l=document.querySelectorAll('[data-reveal]:not([data-shown])');for(var i=0;i<l.length;i++){var r=l[i].getBoundingClientRect();if(r.top<innerHeight&&r.bottom>0)l[i].setAttribute('data-shown','');}},2500);
}catch(e){}})();`;

export function DocumentScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
