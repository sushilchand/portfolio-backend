// ---------- reveal-on-scroll ----------
(function(){
    var targets = document.querySelectorAll('.reveal, .reveal-stagger');
    if(!('IntersectionObserver' in window) || targets.length === 0){
      targets.forEach(function(el){ el.classList.add('in-view'); });
      return;
    }
    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    targets.forEach(function(el){ observer.observe(el); });
  })();

  // ---------- resume chatbot ----------
  (function(){
    var form = document.getElementById('chat-form');
    var questionInput = document.getElementById('chat-question');
    var messages = document.getElementById('chat-messages');
    var jdReport = document.getElementById('jd-report');
    var submit = document.getElementById('chat-submit');
    var jdForm = document.getElementById('jd-form');
    var jdFile = document.getElementById('jd-file');
    var jdSubmit = document.getElementById('jd-submit');
    if(!form || !questionInput || !messages || !jdReport || !submit) return;

    var addMessage = function(container, role, text){
      var message = document.createElement('div');
      message.className = 'chat-message ' + role;
      if(role === 'assistant'){
        var label = document.createElement('span');
        label.className = 'chat-label';
        label.textContent = "Sushil's chatbot";
        message.appendChild(label);
      }
      var body = document.createElement('p');
      body.textContent = text;
      message.appendChild(body);
      container.appendChild(message);
      container.scrollTop = container.scrollHeight;
      return message;
    };

    form.addEventListener('submit', async function(event){
      event.preventDefault();
      var question = questionInput.value.trim();
      if(!question || submit.disabled) return;

      addMessage(messages, 'user', question);
      questionInput.value = '';
      submit.disabled = true;
      submit.innerHTML = 'Thinking <span aria-hidden="true">...</span>';
      var pending = addMessage(messages, 'assistant', 'Thinking...');

      try{
        var response = await fetch('/chat', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({question: question})
        });
        var data = await response.json();
        if(!response.ok) throw new Error(data.detail || 'The chatbot could not answer right now.');
        pending.querySelector('p').textContent = data.answer || 'I could not find an answer in the resume.';
      } catch(error){
        pending.querySelector('p').textContent = error.message;
      } finally{
        submit.disabled = false;
        submit.innerHTML = 'Send question <span aria-hidden="true">→</span>';
        questionInput.focus();
      }
    });

    if(!jdForm || !jdFile || !jdSubmit) return;
    jdForm.addEventListener('submit', async function(event){
      event.preventDefault();
      var file = jdFile.files[0];
      if(!file || jdSubmit.disabled) return;

      jdSubmit.disabled = true;
      jdSubmit.innerHTML = 'Comparing <span aria-hidden="true">...</span>';
      jdReport.classList.add('is-loading');
      jdReport.innerHTML = '<p class="jd-loading">Analyzing ' + file.name + '...</p>';
      var formData = new FormData();
      formData.append('file', file);

      try{
        var response = await fetch('/match-jd', {method: 'POST', body: formData});
        var data = await response.json();
        if(!response.ok) throw new Error(data.detail || 'The job description could not be matched right now.');
        renderJdReport(data, file.name);
      } catch(error){
        jdReport.innerHTML = '<p class="jd-error"></p>';
        jdReport.querySelector('.jd-error').textContent = error.message;
      } finally{
        jdSubmit.disabled = false;
        jdSubmit.innerHTML = 'Compare resume <span aria-hidden="true">→</span>';
        jdReport.classList.remove('is-loading');
      }
    });

    var renderJdReport = function(data, fileName){
      var report = document.createElement('div');
      report.className = 'jd-result';
      var header = document.createElement('div');
      header.className = 'jd-result-header';
      header.innerHTML = '<span class="chat-label">JD comparison</span><span class="jd-file-name"></span>';
      header.querySelector('.jd-file-name').textContent = fileName;
      report.appendChild(header);

      var score = document.createElement('div');
      score.className = 'jd-score';
      score.innerHTML = '<strong></strong><span class="jd-verdict"></span>';
      score.querySelector('strong').textContent = (data.overall_score || 0) + '%';
      score.querySelector('.jd-verdict').textContent = String(data.verdict || '').replaceAll('_', ' ');
      report.appendChild(score);
      appendReportBlock(report, 'Summary', data.summary);
      appendCategoryScores(report, data.category_scores || {});
      appendReportList(report, 'Matched requirements', data.matched_requirements, function(item){
        return item.requirement + ': ' + item.evidence;
      });
      appendReportList(report, 'Missing requirements', data.missing_requirements, function(item){
        return item.requirement + ' (' + item.importance + '): ' + item.reason;
      });
      appendReportList(report, 'Partial matches', data.partial_matches, function(item){
        return item.requirement + ': ' + item.reason + ' Evidence: ' + item.resume_evidence;
      });
      appendReportList(report, 'Strengths', data.strengths);
      appendReportList(report, 'Concerns', data.concerns);
      appendReportList(report, 'Recommendation', data.recommendation_reasons);
      jdReport.replaceChildren(report);
    };

    var appendReportBlock = function(parent, title, text){
      if(!text) return;
      var block = document.createElement('section');
      block.className = 'jd-report-block';
      block.innerHTML = '<h4></h4><p></p>';
      block.querySelector('h4').textContent = title;
      block.querySelector('p').textContent = text;
      parent.appendChild(block);
    };

    var appendCategoryScores = function(parent, scores){
      var block = document.createElement('section');
      block.className = 'jd-report-block';
      var heading = document.createElement('h4');
      heading.textContent = 'Category scores';
      block.appendChild(heading);
      Object.keys(scores).forEach(function(key){
        var row = document.createElement('div');
        row.className = 'jd-score-row';
        row.innerHTML = '<span></span><strong></strong>';
        row.querySelector('span').textContent = key.replaceAll('_', ' ');
        row.querySelector('strong').textContent = scores[key] + '%';
        block.appendChild(row);
      });
      parent.appendChild(block);
    };

    var appendReportList = function(parent, title, items, formatter){
      if(!items || !items.length) return;
      var block = document.createElement('section');
      block.className = 'jd-report-block';
      var heading = document.createElement('h4');
      heading.textContent = title;
      block.appendChild(heading);
      var list = document.createElement('ul');
      items.forEach(function(item){
        var entry = document.createElement('li');
        entry.textContent = formatter ? formatter(item) : item;
        list.appendChild(entry);
      });
      block.appendChild(list);
      parent.appendChild(block);
    };
  })();
  
  // ---------- sticky header shrink/shadow ----------
  (function(){
    var header = document.querySelector('header.topbar');
    if(!header) return;
    var onScroll = function(){
      if(window.scrollY > 12){
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  })();
  
  // ---------- scrollspy: highlight active nav link while scrolling ----------
  (function(){
    var navLinks = document.querySelectorAll('.topbar nav a');
    var sections = Array.prototype.map.call(navLinks, function(link){
      var id = link.getAttribute('href').replace('#', '');
      return document.getElementById(id);
    }).filter(Boolean);
  
    if(!('IntersectionObserver' in window) || sections.length === 0) return;
  
    var setActive = function(id){
      navLinks.forEach(function(link){
        link.classList.toggle('active', link.getAttribute('href') === '#' + id);
      });
    };
  
    var spy = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          setActive(entry.target.id);
        }
      });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
  
    sections.forEach(function(sec){ spy.observe(sec); });
  })();
  
  // ---------- button click ripple ----------
  (function(){
    var buttons = document.querySelectorAll('.btn');
    buttons.forEach(function(btn){
      btn.addEventListener('click', function(e){
        var rect = btn.getBoundingClientRect();
        var size = Math.max(rect.width, rect.height);
        var ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
        btn.appendChild(ripple);
        ripple.addEventListener('animationend', function(){
          ripple.remove();
        });
      });
    });
  })();
  
  // ---------- metric count-up on scroll into view ----------
  (function(){
    var nums = document.querySelectorAll('.metric .num');
    if(!('IntersectionObserver' in window) || nums.length === 0) return;
  
    var animateNum = function(el){
      var raw = el.textContent.trim();
      var match = raw.match(/-?[\d.]+/);
      if(!match){ return; }
      var target = parseFloat(match[0]);
      var prefix = raw.slice(0, match.index);
      var suffix = raw.slice(match.index + match[0].length);
      var decimals = (match[0].split('.')[1] || '').length;
      var duration = 1100;
      var start = null;
  
      var step = function(ts){
        if(start === null) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var current = (target * eased).toFixed(decimals);
        el.textContent = prefix + current + suffix;
        if(progress < 1){
          requestAnimationFrame(step);
        } else {
          el.textContent = raw;
        }
      };
      requestAnimationFrame(step);
    };
  
    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          animateNum(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
  
    nums.forEach(function(el){ observer.observe(el); });
  })();