
// ---------- Claude API helper ----------
async function callClaude(content, opts={}){
  const body = { model: "claude-sonnet-4-6", max_tokens: opts.maxTokens || 1000, messages: [{ role: "user", content: content }] };
  if(opts.system) body.system = opts.system;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
  });
  if(!res.ok){ throw new Error("Request failed (" + res.status + ")"); }
  const data = await res.json();
  const textBlock = data.content.find(b=>b.type==="text");
  if(!textBlock){ throw new Error("No response received."); }
  return textBlock.text;
}
function setLoading(btn, isLoading){ btn.disabled = isLoading; btn.classList.toggle('loading', isLoading); }
function showError(el, msg){ if(!el) return; el.textContent = msg; el.style.display = msg ? 'block' : 'none'; }

// ---------- generic single image slot ----------
function wireImageSlot(prefix, onReady, onCleared){
  const dropZone = document.getElementById(prefix+'DropZone');
  const input = document.getElementById(prefix+'Input');
  const previewWrap = document.getElementById(prefix+'PreviewWrap');
  const preview = document.getElementById(prefix+'Preview');
  const swap = document.getElementById(prefix+'Swap');
  const errEl = document.getElementById(prefix+'Error');
  let data = null;

  dropZone.addEventListener('click', ()=> input.click());
  dropZone.addEventListener('dragover', e=>{ e.preventDefault(); dropZone.classList.add('drag'); });
  dropZone.addEventListener('dragleave', ()=> dropZone.classList.remove('drag'));
  dropZone.addEventListener('drop', e=>{ e.preventDefault(); dropZone.classList.remove('drag'); if(e.dataTransfer.files[0]) handle(e.dataTransfer.files[0]); });
  input.addEventListener('change', ()=>{ if(input.files[0]) handle(input.files[0]); });
  if(swap) swap.addEventListener('click', ()=>{
    data = null; previewWrap.style.display = 'none'; dropZone.style.display = ''; input.value='';
    if(onCleared) onCleared();
  });

  function handle(file){
    if(errEl) showError(errEl, '');
    if(!file.type.match(/image\/(png|jpeg|jpg|webp)/)){ if(errEl) showError(errEl, 'Please upload a PNG, JPG, or WEBP image.'); return; }
    const reader = new FileReader();
    reader.onload = ()=>{
      data = { base64: reader.result.split(',')[1], mediaType: file.type };
      preview.src = reader.result; dropZone.style.display = 'none'; previewWrap.style.display = 'block';
      if(onReady) onReady();
    };
    reader.onerror = ()=>{ if(errEl) showError(errEl, 'Could not read that file.'); };
    reader.readAsDataURL(file);
  }
  return { get: ()=>data };
}

document.addEventListener('DOMContentLoaded', ()=>{
  // char counters
  document.querySelectorAll('[data-count-target]').forEach(ta=>{
    const c = document.getElementById(ta.dataset.countTarget);
    if(!c) return;
    const update = ()=>{ c.textContent = ta.value.length + '/' + ta.getAttribute('maxlength'); };
    ta.addEventListener('input', update); update();
  });
  // copy buttons
  document.querySelectorAll('.copy-btn').forEach(btn=>{
    const original = btn.innerHTML;
    btn.addEventListener('click', ()=>{
      const target = document.getElementById(btn.dataset.copy);
      if(!target) return;
      navigator.clipboard.writeText(target.textContent).then(()=>{
        btn.textContent = 'Copied';
        setTimeout(()=>{ btn.innerHTML = original; }, 1400);
      });
    });
  });
  // segmented controls: generic wiring, stores selection on the control's dataset
  document.querySelectorAll('.segmented').forEach(seg=>{
    const buttons = seg.querySelectorAll('button');
    buttons.forEach(b=>{
      b.addEventListener('click', ()=>{
        buttons.forEach(x=>x.classList.remove('active'));
        b.classList.add('active');
        seg.dataset.selected = b.dataset.val;
      });
    });
  });
});
