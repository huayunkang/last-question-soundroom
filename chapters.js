(() => {
  'use strict';

  const labels = ['钟声', '读信', '现场空白'];
  const ids = ['bell', 'letter', 'gap'];
  const policies = {
    bell: {
      title: '留完整钟尾', voice: '舒岑 · 钟房录音', color: '01', prop: '钟盘', sample: '钟锤与钟房的尾音',
      quote: '我不是要它一直响。只是想知道，它到底是在哪一刻停下来的。',
      keeps: '保留钟声落下之后的细碎回响，至少 20 秒。',
      costs: '读信和空白得让出一些时间；钟声不能替其他人说他们也愿意。',
      signature: '我决定保住钟声的尾部，不把录音站的票当成全体委托。',
      min: [20, 10, 3], initial: [26, 28, 6]
    },
    letter: {
      title: '读全一封信', voice: '林桥 · 纸签背面', color: '02', prop: '折信', sample: '林桥来信的开头',
      quote: '如果只能念一封，请不要把没有说完的地方，替我改成一句祝福。',
      keeps: '从称呼念到落款，给一封信至少 36 秒。',
      costs: '只够为一封信留完整位置；念信的人不是所有沉默的人的代言人。',
      signature: '我决定读完一封信，而不是拼接成一段听起来没人有异议的告别。',
      min: [9, 36, 3], initial: [13, 39, 8]
    },
    gap: {
      title: '留一段现场空白', voice: '周迟 · 值班记录', color: '03', prop: '空椅', sample: '旧声房的底噪',
      quote: '那天大家都没接话。我记得有人把椅子慢慢拉回去了。',
      keeps: '留至少 15 秒的原场底噪，不配旁白，也不补音乐。',
      costs: '若信也念足 36 秒，钟声只剩 9 秒。有人收听这段空白时，也许会以为出了事故。',
      signature: '我决定留一段没有人接话的时间，也承担当中有人会以为我们忘了。',
      min: [9, 12, 15], initial: [18, 22, 20]
    }
  };
  const queries = [
    { id: 'runlist', mark: '01', title: '校对节目单', action: '重合四次修改的节目单',
      name: '节目单 / 主控登记', time: '23:59:00—00:00:00', value: '60 秒',
      text: '折页把四份叫作「最终版」的节目单摞成一张：我的最后一分钟没有延时，两支正在值夜的麦也不会自动切进来。',
      trace: '周迟在旧稿上圈住「空一拍」：这一格保留，不是漏填。' },
    { id: 'align', mark: '02', title: '对齐钟声', action: '按广播时码校准钟房录音',
      name: '钟房录音 / 舒岑', time: '尾部片段 · 00:20', value: '20 秒',
      text: '折页自动标出了电流脉冲和钟锤的撞点，消除了两台设备时间戳上的偏移。完整钟尾可以不带削波保下来。',
      trace: '文件名把「干净版」划掉，补了「有风的也留」。舒岑嫌真正的钟房太安静才显得不像钟房。' },
    { id: 'archive', mark: '03', title: '检索归档', action: '查找未编目的节目资料',
      name: '旧声房 / 索引扫描', time: '当日 · 18 份有声回执', value: '18 份',
      text: '折页把录音、登记行和归档号连到一起。一封念完整要 36 秒的信有录音转写，落款是林桥。同页还登记了纸签入口，但没有电子原件。',
      trace: '归档备注写着「纸签实物交下一个班」。折页把这行列在「待人工查看」，没有替它补字。' }
  ];
  const sources = [
    { id: 'audio', kind: 'A / DIGITAL', title: '录音站回执', detail: '已入索引 · 18 份', counts: [15, 3],
      text: '按节目归档号标记过，折页能搜索、摘录和计数。这是折页刚才回答时访问的来源。' },
    { id: 'paper', kind: 'B / PAPER', title: '门边的纸签', detail: '未入索引 · 12 张', counts: [2, 10],
      text: '留在广播室门边的小铁盒里。林桥的纸签折过一道，没有上传过扫描件。' },
    { id: 'ledger', kind: 'C / LOGBOOK', title: '本班值班簿', detail: '两个入口 · 手写说明',
      text: '23:43　录音、纸签任选一个入口；同一人的两种格式不重复登记。纸签仍在铁盒，换班前没录入。回执自愿填写，不是全校登记。' }
  ];
  const verdicts = [
    { id: 'confirmed', text: '纸签补上之后，票数仍是留钟声领先，所以能代表大家。',
      error: '票数领先没有错，但代表谁？值班簿写的是「回执自愿填写」，不是全校登记。' },
    { id: 'reversed', text: '把纸签也算进去，大家其实更想读留言。',
      error: '纸签里读留言较多，但两处合计是留钟声 17，读留言 13。不要让另一份材料也替全部材料说话。' },
    { id: 'scope', text: '录音站统计只覆盖录音回执；即使补齐，也只说明已交回执。',
      error: '判断可以成立，但先钉 A 和 C 才能证实这句话；要核对两处总数，再打开 B。' }
  ];
  const proof = '录音站 18 份：留钟声 15、读留言 3；另有 12 张未入索引的纸签：留钟声 2、读留言 10。已交回执合计 17／13，不能代称全体。';
  const hints = [
    '先看 A。折页究竟数的是哪一个入口？',
    '把 B 放到 A 旁边逐项相加。纸签偏向读留言，不等于合计票数反转。',
    '打开 C。也可以只钉 A 和 C，先让折页撤回「大家」，再去补查 B。'
  ];
  const discoveryText = {
    scope: '先核对范围：凭录音站和本班值班簿撤回「大家」，然后补查纸签并核对合计。',
    count: '一并提交计数与范围：用录音和纸签核对数量，用值班簿限定范围。'
  };

  const pad = n => String(n).padStart(2, '0');
  const timecode = n => pad(Math.floor(n / 60)) + ':' + pad(n % 60);
  const action = (id, label, extra = '') => `<button type="button" id="${id}" class="ch-btn ${extra}">${label}</button>`;
  const head = (index, strap, title, intro) => `<header class="ch-heading">
      <div class="ch-eyebrow"><b>记录 ${pad(index)} / 05</b><span></span>${strap}</div>
      <h1 id="chapter-title" tabindex="-1">${title}</h1>
      <p>${intro}</p>
    </header>`;
  const nav = (back, nextLabel, ready, note) => `<footer class="ch-nav">
    ${back ? action('ch-back', '← ' + back, 'ch-secondary') : '<span></span>'}
    <p>${note || ''}</p>
    <button type="button" id="ch-next" class="ch-btn ch-primary" ${ready ? '' : 'disabled'}>${nextLabel} <span aria-hidden="true">↗</span></button>
  </footer>`;

  function instrument(mode) {
    if (mode === 'runlist') return `<div class="ch-deck-metric ch-deck-clock">23<span>:</span>59<span>:</span>00</div>
      <p>预定播出窗口 · 不是当前时刻</p>
      <div class="ch-deck-media ch-window" aria-label="从 23:59:00 到次日 00:00:00，共 60 秒">
        <div><span>23:59:00 / 起播</span><span>00:00:00 / 截止</span></div>
        <div class="ch-window-track"><i></i><b>60 秒 · 无延时</b><i></i></div>
      </div>`;
    if (mode === 'align') return `<div class="ch-deck-metric ch-deck-clock">00<span>:</span>20</div>
      <p>完整钟尾 · 已对齐钟锤撞点</p>
      <figure class="ch-deck-media ch-signal" aria-label="钟尾波形示意：从钟锤撞点开始，随房间残响衰减至第 20 秒">
        <svg viewBox="0 0 480 70" preserveAspectRatio="none" aria-hidden="true"><path class="ch-wave-grid" d="M1 1V68M120 1V68M240 1V68M360 1V68M479 1V68M0 35H480"/>
          <path class="ch-wave-envelope" d="M1 35 8 7Q23 13 40 21T78 27T145 31T240 33L478 35 240 37Q178 38 145 39T78 43T40 49T8 63Z"/>
          <path class="ch-wave-bars" d="M8 8v54m7-45v36m7-38v40m8-37v34m9-27v20m11-24v28m11-25v22m13-17v12m12-14v16m15-12v8m15-10v12m16-9v6m17-7v8m20-7v6m23-5v4m25-4v4m29-3v2m34-2v2m40-2v2m50-2v2m60-2v2"/>
        </svg>
        <div aria-hidden="true"><span>00:00 撞点</span><span>00:05</span><span>00:10</span><span>00:15</span><span>00:20</span></div>
        <figcaption>钟尾包络示意，不是分贝刻度。</figcaption>
      </figure>`;
    if (mode === 'archive') return `<div class="ch-deck-metric ch-deck-name">归档索引</div>
      <p>两个登记入口 · 一个当前可搜</p>
      <div class="ch-deck-media ch-index-display"><div><span>A / 录音站</span><b>18 份已索引</b></div><div><span>B / 门边纸签</span><b>仅登记位置</b></div></div>`;
    return `<div class="ch-deck-metric ch-deck-name">等待校对</div>
      <p>主控已就绪 · 尚未检索节目材料</p>
      <div class="ch-deck-media ch-idle"><span>等待指令</span><span>节目单 / 钟房 / 归档</span></div>`;
  }

  function stateFor(s) {
    s.chapter = s.chapter || {};
    s.chapter.queries = s.chapter.queries || [];
    s.chapter.pins = s.chapter.pins || [];
    return s.chapter;
  }

  function applyMix(s, candidate) {
    const p = policies[s.policy];
    if (!p) return;
    const valid = Array.isArray(candidate) && candidate.length === 3 &&
      candidate.every((n, i) => Number.isInteger(n) && n >= p.min[i]) &&
      candidate.reduce((a, b) => a + b, 0) === 60;
    s.mix = (valid ? candidate : p.initial).slice();
    let start = 0;
    s.tracks = s.mix.map((duration, i) => {
      const end = start + duration;
      const entry = { id: ids[i], label: labels[i], start, end, duration };
      start = end;
      return entry;
    });
    stateFor(s).mixMood = mood(s.mix).id;
  }

  function mood([bell, letter, gap]) {
    if (gap >= 19) return { id: 'open', title: '房间还亮着', text: '主持人退开很久。听众可以听见房间，而不只等一句结束语。' };
    if (gap <= 6) return { id: 'tight', title: '余地很窄', text: '最后只剩很短一口气，广播没有为回响多停一拍。' };
    if (letter >= 36) return { id: 'signed', title: '落款之后', text: '最后一个名字说完，随后仍有一段时间不替它解释。' };
    if (bell >= 20) return { id: 'ring', title: '钟尾还在', text: '完整钟尾先慢慢落下，留白把尾部的余速交给听众。' };
    return { id: 'handoff', title: '把声音交给房间', text: '两段可辨的声音过去之后，房间有时间自己收尾。' };
  }

  function seamBounds(i, mix, policy) {
    const min = policy.min;
    if (i === 0) return { min: min[0], max: mix[0] + mix[1] - min[1], now: mix[0] };
    return { min: mix[0] + min[1], max: 60 - min[2], now: mix[0] + mix[1] };
  }

  function chapterOne(d) {
    const selected = queries.find(q => q.id === d.lastQuery);
    return `<div class="ch-page ch-one">
    ${head(1, '2041 / 大学旧声房', '把今天理出来', '离毕业前最后一次广播还有一会儿。你把节目单、钟房录音和零散的回执摊开；折页已经认出了其中大半。')}
    <div class="ch-one-grid">
      <section class="ch-deck" aria-label="一分钟广播的主控仪表" data-instrument="${selected?.id || 'idle'}">
        <div class="ch-deck-top"><span><i></i> OLD SOUND ROOM</span><span>FM / 主控未上行</span></div>
        ${instrument(selected?.id)}
        <div class="ch-deck-bottom"><b>折页在线</b><span>素材未发射</span></div>
      </section>
      <section class="ch-query-list" aria-label="为折页选择检索指令">
        <span class="ch-kicker">01—03 / 工作指令</span>
        <p>节目单有四份，钟声没对齐，档案还没闭合。先让折页替你做哪一件？</p>
        ${queries.map(q => `<button type="button" class="ch-query" id="ch-q-${q.id}" data-query="${q.id}" aria-pressed="${selected?.id === q.id}">
          <span>${q.mark}</span><span><b>${q.title}</b><small>${q.action}</small></span><em aria-label="${d.queries.includes(q.id) ? '已整理' : '待查询'}">${d.queries.includes(q.id) ? '✓' : '＋'}</em>
        </button>`).join('')}
      </section>
    </div>
    <div class="ch-find" aria-live="polite">
      ${selected ? `<div class="ch-find-value"><span>${selected.name}</span><b>${selected.value}</b><span>${selected.time}</span></div>
      <div><h2>折页返回</h2><p>${selected.text}</p><p class="ch-trace">${selected.trace}</p></div>` :
      '<div class="ch-find-value"><span>检索缓冲区</span><b>—</b><span>尚无请求</span></div><div><h2>折页在等你开口</h2><p>「我可以先把重复的东西叠起来。你要找什么？」</p><p class="ch-trace">窗缝里有风，耳机底下压着一张还没填写的纸签。</p></div>'}
    </div>
    ${nav(null, '去看回执', d.queries.length >= 2, `已校对 ${d.queries.length} / 3 · 至少查看两项`)}
    </div>`;
  }

  function countComparison() {
    const line = (name, bell, letter) => {
      const total = bell + letter;
      const pct = value => (100 * value / total).toFixed(1) + '%';
      return `<div class="ch-ratio-row">
        <b>${name} · 分母 ${total}</b>
        <div class="ch-ratio-strip" aria-hidden="true"><i style="flex-grow:${bell}"></i><i style="flex-grow:${letter}"></i></div>
        <span><i></i> 钟声 ${bell} / ${pct(bell)}</span><span><i></i> 留言 ${letter} / ${pct(letter)}</span>
      </div>`;
    };
    return `<figure class="ch-ratio" aria-label="两种统计分母下的票数与比例">
      ${line('仅录音回执', 15, 3)}
      ${line('全部已交回执', 17, 13)}
      <figcaption>分母从 18 到 30，钟声仍领先，但只领先 4 票。两个分母都不代表全校。</figcaption>
    </figure>`;
  }

  function receiptTape(paperOpened, verified) {
    const band = (id, count, bells, read) => `<div class="ch-band ch-band-${id}">
      <b>${id === 'audio' ? 'A · 录音站 / 18 份' : read ? 'B · 门边纸签 / 12 张' : 'B · 纸签尚未读入'}</b>
      <div class="ch-holes" aria-hidden="true" style="--holes:${count}">${Array.from({ length: count }, (_, i) =>
        `<i class="${read ? i < bells ? 'is-bell' : 'is-letter' : 'is-unknown'}" style="--hole:${i}"></i>`).join('')}</div>
      <small>${read ? `钟声 ${bells} · 读留言 ${count - bells}` : '空孔是占位，不能视为零票。'}</small>
    </div>`;
    return `<figure class="ch-receipt-tape${paperOpened ? ' is-loaded' : ''}${verified ? ' is-sealed' : ''}" aria-label="两份回执的打孔证据带">
      <figcaption><b>回执光读带</b><span><i></i> 钟声 <i></i> 读留言</span></figcaption>
      <div class="ch-tape-fold">${band('audio', 18, 15, true)}${band('paper', 12, 2, paperOpened)}</div>
    </figure>`;
  }

  function chapterTwo(d, s) {
    const pinned = source => d.pins.includes(source.id);
    const scopeOnly = d.discovery === 'scope' && !s.proof;
    const paperOpened = Boolean(d.paperOpened || d.pins.includes('paper') || s.proof);
    const showTotal = d.pins.includes('audio') && d.pins.includes('paper');
    const paperCovered = src => src.id === 'paper' && !paperOpened;
    const active = sources.find(src => src.id === d.activeSource) || sources[0];
    return `<div class="ch-page ch-two">
    ${head(2, '材料核对 / 23:47', '它数对了吗？', '灯还亮着。你问折页最后一分钟要留什么，它比你更早给出了一个笃定的答案。')}
    <blockquote class="ch-claim"><span>折页 / ${scopeOnly ? '已撤回外推' : s.proof ? '原答复 · 已修订' : '检索后答复'}</span><p>${scopeOnly
      ? '「我先撤回『大家』。值班簿指向门边的小铁盒，那里还有没录入的纸签；我不能替你报出它们的票数。」'
      : '「录音站 18 份回执里，有 15 份选了留钟声。大家想留钟声，可以按这个意见定稿。」'}</p></blockquote>
    <div class="ch-desk" aria-label="证物抽屉">
      <div class="ch-drawer">
        <div class="ch-drawer-label">索引 / 翻原件或直接钉入</div>
        ${sources.map((src, i) => `<div class="ch-file-tab${active.id === src.id ? ' is-active' : ''}${pinned(src) ? ' is-pinned' : ''}${scopeOnly && paperCovered(src) ? ' is-referred' : ''}">
          <button type="button" id="ch-open-${src.id}" data-source="${src.id}" aria-controls="ch-original" aria-pressed="${active.id === src.id}"><small>${String.fromCharCode(65 + i)}</small><b>${src.title}</b></button>
          <button type="button" id="ch-pin-${src.id}" class="ch-pin" data-pin="${src.id}" aria-pressed="${pinned(src)}" aria-label="${pinned(src) ? '已钉：' : paperCovered(src) ? '打开并钉入：' : '钉入：'}${src.title}" ${s.proof ? 'disabled' : ''}>${pinned(src) ? '✓' : '+'}<span>${pinned(src) ? '已钉' : '钉'}</span></button>
        </div>`).join('')}
      </div>
      <div class="ch-original-stack">
        <article id="ch-original" class="ch-source ch-source-${active.id}" aria-live="polite">
          <div class="ch-source-index"><span>${active.kind} / ORIGINAL</span><span>${pinned(active) ? '已钉' : '原件'}</span></div>
          <h2>${active.title}</h2><p class="ch-source-detail">${paperCovered(active) ? '未入索引 · 需人工查看' : active.detail}</p>
          ${active.counts && !paperCovered(active) ? `<div class="ch-votes"><div><b>${active.counts[0]}</b><span>留钟声</span></div><div><b>${active.counts[1]}</b><span>读留言</span></div></div>` : ''}
          <p class="ch-source-copy">${paperCovered(active) ? '一个没有电子副本的小铁盒。打开后，才能读到纸签上的选项。' : active.text}</p>
        </article>
      </div>
    </div>
    ${receiptTape(paperOpened, Boolean(s.proof))}
    <div class="ch-audit">
      <div class="ch-audit-left">
        <span class="ch-kicker">核对栏 / ${d.pins.length} 张</span>
        <h2>把话定在材料有权说的地方。</h2>
        <p>可以先把两份计数并排，也可以只用录音和值班簿，先核对这句话的范围。</p>
        <div class="ch-crosscheck" aria-live="polite">
          <div><b>人数层</b><span>${showTotal ? '相加：30 份，钟声 17／留言 13。' : '还不能看合计；须并排钉入 A、B。'}</span></div>
          <div><b>范围层</b><span>${d.pins.includes('ledger') ? 'C：两种提交方式，自愿登记，不覆盖全校。' : '还没有纳入 C 的登记说明。'}</span></div>
        </div>
        ${showTotal ? countComparison() : ''}
        <button type="button" id="ch-hint" class="ch-quiet-btn" ${s.proof ? 'hidden' : ''}>${d.hint ? '下一条提示' : '给我一条提示'}</button>
        ${d.hint && !s.proof ? `<p class="ch-hint" role="status">提示 ${d.hint} / 3 · ${hints[d.hint - 1]}</p>` : ''}
      </div>
      <div class="ch-audit-right">
        <div class="ch-verdicts" role="group" aria-label="修订折页的判断">
          ${verdicts.map((v, i) => `<button type="button" id="ch-verdict-${v.id}" class="ch-verdict${d.verdict === v.id ? ' is-chosen' : ''}" data-verdict="${v.id}" aria-pressed="${d.verdict === v.id}" ${s.proof ? 'disabled' : ''}>
            <span>${String.fromCharCode(65 + i)}</span>${v.text}
          </button>`).join('')}
        </div>
        <p class="ch-feedback${s.proof ? ' is-verified' : scopeOnly ? ' is-partial' : ''}" role="status">${s.proof ? '已修订 · ' + proof
          : d.evidenceFeedback || (scopeOnly ? '范围已确认，票数尚待核对。打开并钉入 B，才能把两处计数合起来。' : '选一句能被你钉住的原件支持的话。')}</p>
        ${scopeOnly && !d.pins.includes('paper') ? '<button type="button" id="ch-find-paper" class="ch-quiet-btn">↑ 回到 B / 门边的纸签</button>' : ''}
      </div>
    </div>
    ${s.proof ? `<blockquote class="ch-reply">${d.discovery === 'scope' ? '折页把从纸上手工补齐的总数写在修订下面。' : '折页把刚才那句「大家」撤下来，换成「已交回执」。'}随后它问：「那没交的人，要怎么给他们留位置？」</blockquote>` : ''}
    ${nav('回工作台', '到编辑台', Boolean(s.proof), s.proof ? '修订已经写入证据本' : scopeOnly ? '范围异议已保留 · 还需核对纸签' : '校对原件后才可提交修订')}
    </div>`;
  }

  function chapterThree(d, s) {
    const key = d.policyChoice || s.policy || 'bell';
    const p = policies[key];
    const signed = s.policy === key;
    return `<div class="ch-page ch-three">
    ${head(3, '三席 / 23:52', '你把话筒留给谁？', '钟尾、落款、空椅，在桌上隔着一臂之遥。若把三样完整留下，要 71 秒；节目单只给了 60 秒。点亮一件东西，看看你会保住什么。')}
    <div class="ch-stage" data-object="${key}" role="group" aria-label="同一间声房中的三个可点击物件">
      <img src="assets/stage.webp" alt="同一张木台上，左边是钟盘，中间立着折信，右边留有空椅。">
      <div class="ch-stage-lens" aria-hidden="true"></div>
      ${ids.map(id => `<button type="button" id="ch-policy-${id}" class="ch-stage-hit ch-hit-${id}" data-policy="${id}" aria-pressed="${key === id}" aria-label="${policies[id].prop}：${policies[id].title}">
        <i aria-hidden="true"></i><span><small>${policies[id].color}</small> ${policies[id].prop}</span>
      </button>`).join('')}
      <p class="ch-stage-caption" aria-hidden="true">全景 / 请选择场内的物件</p>
    </div>
    <div class="ch-editor">
      <div class="ch-stage-cut ch-cut-${key}" aria-hidden="true"><span>镜头 ${p.color} / ${p.prop}</span></div>
      <article class="ch-choice ch-choice-${key}">
        <div class="ch-choice-meta"><span>草案 ${p.color} / ${p.title}</span><span>可重新签发</span></div>
        <blockquote>${p.quote}</blockquote>
        <p class="ch-voice">${p.voice}</p>
        <p class="ch-evidence-sample"><span>声样 · ${p.sample} <small>（静音时不自动开声）</small></span>
          ${action('ch-audition', '▷ 试听此处', 'ch-secondary')}
        </p><p class="ch-audition-status" id="ch-audition-status" role="status"></p>
        <dl><dt>保住</dt><dd>${p.keeps}</dd><dt>让出</dt><dd>${p.costs}</dd></dl>
        <div class="ch-sign">
          <p>${p.signature}</p>
          ${action('ch-sign', signed ? '✓ 承诺已签发' : '签发这份承诺', signed ? 'ch-signed' : 'ch-secondary')}
        </div>
      </article>
    </div>
    <p class="ch-editor-echo">折页：「我能按你选的那条线重排，不能保证每个听众都会满意。」</p>
    ${nav('回看证物', '去合编一分钟', signed, signed ? '承诺已签发 · 排轨须遵守它' : '可预览任一草案；签发后方可排轨')}
    </div>`;
  }

  function chapterFour(s) {
    const p = policies[s.policy];
    if (!p) return `<div class="ch-page ch-four">${head(4, '合编台 / 23:56', '把一分钟做出来', '先回编辑台签发一份承诺。')}${nav('回编辑台', '封存这一版', false, '')}</div>`;
    const mix = s.mix;
    const ending = mood(mix);
    return `<div class="ch-page ch-four">
    ${head(4, '合编台 / 23:56', '把一分钟做出来', '折页按你的承诺排了第一版。拖动接缝可以在相邻两段之间调配时间；也可以用滑杆直接调整钟声和读信，把剩下的时间留给房间。')}
    <section class="ch-mix" id="ch-edit-bed" data-mood="${ending.id}" aria-label="六十秒合编台">
      <div class="ch-mix-head">
        <div><span class="ch-kicker">折页工作批注</span><h2>${p.title}</h2><p>${p.keeps}</p></div>
        <div class="ch-mix-clock"><b>01<span>:</span>00</b><small>固定播出长度</small></div>
      </div>
      <div class="ch-ruler" aria-hidden="true">${[0, 10, 20, 30, 40, 50, 60].map(n => `<span>${timecode(n)}</span>`).join('')}</div>
      <div class="ch-timeline" id="ch-timeline" aria-label="从左到右：钟声、读信、现场空白">
        <div class="ch-film" aria-hidden="true">${ids.map((id, i) => `<div class="ch-segment ch-segment-${id}" id="ch-seg-${id}" style="flex-grow:${mix[i]}"><b>${labels[i]}</b><span id="ch-dur-${id}">${mix[i]}秒</span></div>`).join('')}</div>
        ${['钟声与读信', '读信与留白'].map((label, i) => {
          const cut = seamBounds(i, mix, p);
          return `<div tabindex="0" role="slider" aria-label="${label}的接缝" aria-describedby="ch-seam-help" aria-valuemin="${cut.min}" aria-valuemax="${cut.max}" aria-valuenow="${cut.now}" aria-valuetext="位于第 ${cut.now} 秒" id="ch-seam-${i}" class="ch-seam ch-seam-${i}" style="--cut:${100 * cut.now / 60}%">
            <i aria-hidden="true"></i><span aria-hidden="true">↔</span>
          </div>`;
        }).join('')}
      </div>
      <ol class="ch-track-list" aria-label="逐轨实际开始与结束时间">${s.tracks.map(t => `<li><b>${t.label}</b><span id="ch-time-${t.id}">${timecode(t.start)}—${timecode(t.end)}</span></li>`).join('')}</ol>
      <p id="ch-seam-help" class="ch-seam-help">拖动带有 ↔ 的两处接缝，改变相邻两段的分配。也可聚焦接缝用方向键，或用下方滑杆调整。</p>
      <div class="ch-faders">
        ${ids.slice(0, 2).map((id, i) => `<div class="ch-fader">
          <label for="ch-range-${id}">${labels[i]} <output for="ch-range-${id}" id="ch-val-${id}">${mix[i]} 秒</output></label>
          <input type="range" id="ch-range-${id}" min="${p.min[i]}" max="${60 - p.min[2] - mix[1 - i]}" step="1" value="${mix[i]}" aria-describedby="ch-limits-${id}">
          <span id="ch-limits-${id}">至少 ${p.min[i]} 秒；另一条调低后可继续增加。</span>
        </div>`).join('')}
        <div class="ch-room-meter"><span>现场空白 · 自动留出</span><b id="ch-val-gap">${mix[2]} 秒</b><small>不低于 ${p.min[2]} 秒</small></div>
      </div>
      <div class="ch-transport">
        ${action('ch-preview', '▷ 试听当前版', 'ch-secondary')}${action('ch-reset-mix', '回到折页提案', 'ch-secondary')}
        <span id="ch-mix-status" role="status">总长 60 秒。当前分配符合承诺。</span>
      </div>
      <div id="ch-mix-mood" class="ch-mix-mood"><b>${ending.title}</b><p>${ending.text}</p></div>
      <details class="ch-transcript">
        <summary>素材库 · 林桥来信 / 完整转写</summary>
        <p>给下一班值夜的人：</p>
        <p>我把钥匙搁在窗边的小碟上。风大的时候，它会碰到碟沿。以前我总嫌响，这星期却故意没把它收好。</p>
        <p>如果你进来发现屋里空着，别急着把什么都关掉。等钟响完，再把椅子往里推一点。有人没赶上说再见，也许只是以为明天还会来。</p>
        <p>林桥。</p>
        <p>这是完整录音的文字。分配不足 36 秒时，成片只取其中一段。</p>
      </details>
    </section>
    <aside class="ch-mix-note"><span>仍然成立 / 已核证</span><p>两种入口合计是 17／13，不是全体人数。<br>这条事实附在编辑记录里，不混入广播录音。</p></aside>
    ${nav('回编辑台', '封存，等上行', true, '合编完成后，按当前时间轴封存')}
    </div>`;
  }

  function render(ch, s, api, restore, effect) {
    const scene = document.getElementById('scene');
    if (!scene || ch < 1 || ch > 4) return;
    const d = stateFor(s);
    if (ch === 4 && policies[s.policy]) applyMix(s, s.mix);
    scene.innerHTML = [null, chapterOne, chapterTwo, chapterThree, (_, state) => chapterFour(state)][ch](d, s);
    const get = id => scene.querySelector('#' + id);
    const all = sel => [...scene.querySelectorAll(sel)];
    const refresh = (id, nextEffect) => { api.save(); render(ch, s, api, id, nextEffect); };
    const on = (id, fn) => get(id)?.addEventListener('click', fn);
    const playTone = kind => api.tone?.(kind);
    if (restore) {
      const target = get(restore);
      if (target && !target.disabled) target.focus({ preventScroll: true });
      else get('ch-next')?.focus({ preventScroll: true });
    }
    on('ch-back', () => { api.stop?.(); api.go(ch - 1); });
    on('ch-next', () => {
      api.stop?.();
      if (ch === 4) { applyMix(s, s.mix); d.finishedMix = true; }
      api.save();
      api.go(ch + 1);
    });
    if (ch === 1) all('[data-query]').forEach(el => el.addEventListener('click', () => {
      const key = el.dataset.query;
      if (!d.queries.includes(key)) d.queries.push(key);
      d.lastQuery = key;
      playTone('button');
      refresh(el.id);
    }));
    if (ch === 2) {
      if (effect) scene.querySelector('.ch-desk')?.classList.add('is-replacing');
      if (effect === 'feed' || effect === 'seal') scene.querySelector('.ch-receipt-tape')?.classList.add('is-' + effect);
      const fullyPinned = () => sources.every(src => d.pins.includes(src.id));
      const complete = () => {
        d.discovery ||= 'count';
        d.verdict = 'scope';
        d.evidenceFeedback = '';
        s.proof = proof;
      };
      all('[data-source]').forEach(el => el.addEventListener('click', () => {
        const key = el.dataset.source;
        const opened = key === 'paper' && !d.paperOpened;
        if (opened) d.paperOpened = true;
        d.activeSource = key;
        playTone('button');
        refresh(el.id, opened ? 'feed' : 'turn');
      }));
      all('[data-pin]').forEach(el => el.addEventListener('click', () => {
        const key = el.dataset.pin;
        d.pins = d.pins.includes(key) ? d.pins.filter(x => x !== key) : [...d.pins, key];
        const opened = key === 'paper' && !d.paperOpened;
        if (opened) d.paperOpened = true;
        d.activeSource = key;
        d.evidenceFeedback = '';
        d.verdict = '';
        if (d.discovery === 'scope' && fullyPinned()) complete();
        playTone('button');
        refresh(el.id, s.proof ? 'seal' : opened ? 'feed' : 'turn');
      }));
      on('ch-hint', () => { d.hint = Math.min((d.hint || 0) + 1, hints.length); refresh('ch-hint'); });
      on('ch-find-paper', () => get('ch-pin-paper')?.focus());
      all('[data-verdict]').forEach(el => el.addEventListener('click', () => {
        const key = el.dataset.verdict;
        d.verdict = key;
        if (key === 'scope' && fullyPinned()) {
          complete();
          playTone('button');
        } else if (key === 'scope' && d.pins.includes('audio') && d.pins.includes('ledger')) {
          d.discovery = 'scope';
          d.evidenceFeedback = '';
          playTone('button');
        } else {
          d.evidenceFeedback = key !== 'scope' && !d.pins.includes('paper')
            ? '这个判断用到了还未钉入的纸签。先不要替纸签报数；可以先核对录音站覆盖的范围。'
            : verdicts.find(v => v.id === key).error;
        }
        refresh(el.id, s.proof ? 'seal' : '');
      }));
    }
    if (ch === 3) {
      if (effect === 'pick') scene.querySelector('.ch-three')?.classList.add('is-picking');
      all('[data-policy]').forEach(el => el.addEventListener('click', () => {
        api.stop?.();
        d.policyChoice = el.dataset.policy;
        playTone('button');
        refresh(el.id, 'pick');
      }));
      on('ch-sign', () => {
        api.stop?.();
        const chosen = d.policyChoice || s.policy || 'bell';
        if (s.policy !== chosen) {
          d.finishedMix = false;
          s.policy = chosen;
          applyMix(s, null);
        }
        playTone('button');
        refresh('ch-sign');
      });
      const cue = get('ch-audition');
      const cueStatus = get('ch-audition-status');
      cue?.setAttribute('aria-pressed', 'false');
      on('ch-audition', () => {
        const setCue = (on, message) => {
          if (!cue.isConnected) return;
          cue.setAttribute('aria-pressed', String(on));
          cue.textContent = on ? '■ 停止声样' : '▷ 试听此处';
          cueStatus.textContent = message;
        };
        if (cue.getAttribute('aria-pressed') === 'true') {
          api.stop?.();
          setCue(false, '声样已停止。');
          return;
        }
        if (!api.audition) { setCue(false, '当前无法试听，可继续阅读证言。'); return; }
        setCue(true, '正在试听；如已静音，可在页首开启声音。');
        try {
          Promise.resolve(api.audition(d.policyChoice || s.policy || 'bell', () => setCue(false, '声样结束。')))
            .catch(() => setCue(false, '当前无法试听，可继续阅读证言。'));
        } catch { setCue(false, '当前无法试听，可继续阅读证言。'); }
      });
    }
    if (ch === 4 && policies[s.policy]) {
      const sliders = ids.slice(0, 2).map(id => get('ch-range-' + id));
      const seams = [get('ch-seam-0'), get('ch-seam-1')];
      const play = get('ch-preview');
      const status = get('ch-mix-status');
      const timeline = get('ch-timeline');
      const setPreview = (active, message) => {
        if (!play.isConnected) return;
        play.textContent = active ? '■ 停止试听' : '▷ 试听当前版';
        play.setAttribute('aria-pressed', String(active));
        timeline.classList.toggle('is-playing', active);
        status.textContent = message;
      };
      play.setAttribute('aria-pressed', 'false');
      const update = message => {
        d.finishedMix = false;
        api.stop?.();
        const p = policies[s.policy];
        sliders.forEach((slider, i) => {
          slider.max = 60 - p.min[2] - s.mix[1 - i];
          slider.value = s.mix[i];
        });
        seams.forEach((seam, i) => {
          const cut = seamBounds(i, s.mix, p);
          seam.style.setProperty('--cut', 100 * cut.now / 60 + '%');
          ['min', 'max', 'now'].forEach(k => seam.setAttribute('aria-value' + k, String(cut[k])));
          seam.setAttribute('aria-valuetext', `位于第 ${cut.now} 秒`);
        });
        s.tracks.forEach(t => {
          get('ch-seg-' + t.id).style.flexGrow = t.duration;
          get('ch-dur-' + t.id).textContent = t.duration + '秒';
          get('ch-time-' + t.id).textContent = timecode(t.start) + '—' + timecode(t.end);
          get('ch-val-' + t.id).textContent = t.duration + ' 秒';
        });
        const ending = mood(s.mix);
        const moodNode = get('ch-mix-mood');
        get('ch-edit-bed').dataset.mood = ending.id;
        moodNode.firstElementChild.textContent = ending.title;
        moodNode.lastElementChild.textContent = ending.text;
        api.save();
        setPreview(false, message);
      };
      const moveSeam = (i, second) => {
        const p = policies[s.policy];
        const candidate = s.mix.slice();
        const cut = seamBounds(i, candidate, p);
        const target = Math.max(cut.min, Math.min(cut.max, second));
        if (target === cut.now) return;
        if (i === 0) {
          candidate[1] = candidate[0] + candidate[1] - target;
          candidate[0] = target;
        } else {
          candidate[1] = target - candidate[0];
          candidate[2] = 60 - target;
        }
        applyMix(s, candidate);
        update(`接缝移至第 ${target} 秒。总长仍是 60 秒。`);
      };
      seams.forEach((seam, i) => {
        let pointer, originX, originSecond;
        const drag = e => {
          const { width } = timeline.getBoundingClientRect();
          if (width) moveSeam(i, Math.round(originSecond + 60 * (e.clientX - originX) / width));
        };
        seam.addEventListener('pointerdown', e => {
          if (!e.isPrimary || e.button !== 0 || pointer != null) return;
          seam.focus({ preventScroll: true });
          seam.setPointerCapture(e.pointerId);
          pointer = e.pointerId;
          originX = e.clientX;
          originSecond = seamBounds(i, s.mix, policies[s.policy]).now;
        });
        seam.addEventListener('pointermove', e => { if (e.pointerId === pointer) drag(e); });
        seam.addEventListener('pointerup', e => { if (e.pointerId === pointer) { drag(e); pointer = null; } });
        seam.addEventListener('lostpointercapture', () => { pointer = null; });
        seam.addEventListener('keydown', e => {
          const { min, max, now } = seamBounds(i, s.mix, policies[s.policy]);
          const target = { ArrowLeft: now - 1, ArrowDown: now - 1, ArrowRight: now + 1, ArrowUp: now + 1, Home: min, End: max }[e.key];
          if (target == null) return;
          e.preventDefault();
          moveSeam(i, target);
        });
      });
      sliders.forEach((slider, i) => slider.addEventListener('input', () => {
        const candidate = s.mix.slice();
        candidate[i] = Number(slider.value);
        candidate[2] = 60 - candidate[0] - candidate[1];
        applyMix(s, candidate);
        update(`总长 60 秒；留给现场的空白是 ${s.mix[2]} 秒。`);
      }));
      on('ch-reset-mix', () => {
        applyMix(s, null);
        update('已回到折页提案。总长仍是 60 秒。');
      });
      on('ch-preview', () => {
        const waiting = play.getAttribute('aria-pressed') === 'true';
        if (waiting) {
          api.stop?.();
          setPreview(false, '试听停下了，分配没有改变。');
          return;
        }
        setPreview(true, '正在按当前分配试听；静音时只走表，可在页首开启声音。');
        const unavailable = () => setPreview(false, '此处无法播放声音。仍可检查和封存时间轴。');
        try {
          if (!api.preview) { unavailable(); return; }
          const result = api.preview(s.mix.slice(), () => setPreview(false, '试听结束。你仍然可以调整。'));
          if (result === false) unavailable();
          if (result?.catch) result.catch(unavailable);
        } catch { unavailable(); }
      });
    }
  }

  function notes(s) {
    const d = s.chapter || {};
    const records = queries.filter(q => d.queries?.includes(q.id)).map(q => q.title + '：' + q.value + '｜' + q.trace);
    const p = policies[s.policy];
    const discovery = s.proof ? discoveryText[d.discovery] : d.discovery === 'scope'
      ? '已用录音站和本班值班簿确认范围；纸签计数尚未核对。' : '';
    return [
      '［工作台］', records.length ? records.join('\n') : '还没有整理原始材料。',
      '［核对栏］', s.proof || (d.pins?.length ? '已暂钉：' + sources.filter(src => d.pins.includes(src.id)).map(src => src.title).join('、') + '。' : '尚未核对录音站的统计口径。'),
      ...(discovery ? [discovery] : []),
      '［编辑承诺］', p ? p.signature : '尚未签发。',
      '［时间轴］', s.tracks?.length ? s.tracks.map(t => `${timecode(t.start)}—${timecode(t.end)}　${t.label} ${t.duration} 秒`).join('\n') : '还没有排轨。',
      ...(Array.isArray(s.mix) ? ['收尾氛围：' + mood(s.mix).title + '。'] : [])
    ].join('\n');
  }

  window.Chapters = { render, notes };
})();
