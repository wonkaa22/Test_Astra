/* selenujo.js — transforms ForumActif pages for the Selenujo theme
   Chargé depuis GitHub Pages ; n'utilise aucune variable FA entre accolades. */

/* ── Page Valero (viewforum) ─────────────────────────────────────────────── */
(function selViewforumTransform() {
  var body      = document.body;
  var children  = Array.prototype.slice.call(body.children);
  var catBlock  = children.filter(function (el) { return el.classList.contains('cat-block'); })[0];
  var forumbgs  = children.filter(function (el) { return el.classList.contains('forumbg'); });
  var topicsBox = forumbgs.length ? forumbgs[forumbgs.length - 1] : null;

  if (!topicsBox) { return; }

  var topActions    = document.querySelector('.topic-actions:not(.bottom)');
  var bottomActions = document.querySelector('.topic-actions.bottom');

  var newOrder = children.filter(function (el) { return el !== catBlock; });
  if (catBlock) {
    var insertAfter = (bottomActions && newOrder.indexOf(bottomActions) > -1) ? bottomActions : topicsBox;
    newOrder.splice(newOrder.indexOf(insertAfter) + 1, 0, catBlock);
  }

  body.style.display = 'flex';
  body.style.flexDirection = 'column';
  newOrder.forEach(function (el, i) { el.style.order = i; });

  var widthTargets = document.querySelectorAll('.cat-block, .forumbg, .sub-header, #page-desc, .topic-actions, .pagination, form[name="jumpbox"]');
  widthTargets.forEach(function (el) { el.classList.add('forum-width'); });

  var pathEl = document.querySelector('.sub-header-path');
  if (pathEl) {
    Array.prototype.forEach.call(pathEl.childNodes, function (node) {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent = node.textContent.replace(/::/g, '☽');
      }
    });
  }

  document.querySelectorAll('ul.topiclist.topics.bg_none dl.icon').forEach(function (dl) {
    var bg    = dl.style.backgroundImage || '';
    var dterm = dl.querySelector('dd.dterm');
    var isUnread = /unread/i.test(bg);
    var badge = document.createElement('span');
    badge.className = 'topic-status-icon' + (isUnread ? ' is-unread' : '');
    badge.textContent = '☽';
    if (dterm) { dterm.insertBefore(badge, dterm.firstChild); }
  });

  document.querySelectorAll('ul.topiclist.topics.bg_none li.row').forEach(function (li) {
    var dl = li.querySelector('dl.icon');
    if (!dl) { return; }
    var dterm = dl.querySelector('dd.dterm');
    var posts = dl.querySelector('dd.posts');
    var views = dl.querySelector('dd.views');
    if (!dterm || (!posts && !views)) { return; }
    var wrap = document.createElement('div');
    wrap.className = 'topic-stats';
    if (views) { wrap.appendChild(views); }
    if (posts) { wrap.appendChild(posts); }
    dterm.appendChild(wrap);
  });

  document.querySelectorAll('dd.lastpost').forEach(function (dd) {
    var avatar = dd.querySelector('.lastpost-avatar');
    var nameEl = dd.querySelector('strong');
    var anchors = Array.prototype.slice.call(dd.querySelectorAll('a')).filter(function (a) {
      if (avatar && avatar.contains(a)) { return false; }
      if (nameEl && nameEl.contains(a)) { return false; }
      return true;
    });
    if (!anchors.length) { return; }
    var jumpLink = anchors[anchors.length - 1];
    anchors.forEach(function (a) { if (a !== jumpLink) { a.remove(); } });
    jumpLink.textContent = '☽';
    jumpLink.classList.add('lastpost-jump');
    dd.appendChild(jumpLink);
  });

  document.querySelectorAll('dd.dterm img').forEach(function (img) { img.remove(); });

  document.querySelectorAll('.search-box button').forEach(function (btn) { btn.innerHTML = '☽'; });

  var allPaginations = Array.prototype.slice.call(document.querySelectorAll('.pagination'));
  var topPagination    = allPaginations[0];
  var bottomPagination = allPaginations.length > 1 ? allPaginations[allPaginations.length - 1] : null;

  if (topActions) {
    var topBar     = topActions.querySelector('.topic-actions-buttons');
    var subBtns    = document.querySelector('.sub-header-buttons');
    var postBtn    = subBtns ? subBtns.querySelector('a.button1[href*="mode=newtopic"]') : null;
    var searchBox  = subBtns ? subBtns.querySelector('.search-box') : null;
    var sortBox    = bottomActions ? bottomActions.querySelector('#sort-box') : null;
    if (topBar) {
      topBar.innerHTML = '';
      if (postBtn)      { topBar.appendChild(postBtn); }
      if (sortBox)      { topBar.appendChild(sortBox); }
      if (searchBox)    { topBar.appendChild(searchBox); }
      if (topPagination) { topPagination.classList.add('pagination-inline'); topBar.appendChild(topPagination); }
    }
    if (subBtns) { subBtns.remove(); }
  }

  if (bottomActions) {
    var bottomPostBtn = bottomActions.querySelector('a.button1[href*="mode=newtopic"]');
    if (bottomPostBtn) { bottomPostBtn.remove(); }
    var bottomBar = bottomActions.querySelector('.topic-actions-buttons');
    if (bottomBar && bottomPagination) {
      bottomPagination.classList.add('pagination-inline');
      bottomBar.appendChild(bottomPagination);
    }
  }

  document.querySelectorAll('.topic-actions-buttons').forEach(function (bar) {
    Array.prototype.slice.call(bar.children).forEach(function (child) {
      var label = (child.textContent || '').trim();
      if (label === 'Plus !' || child.id === 'plus-link' || child.id === 'plus-menu') {
        child.remove();
      }
    });
  });

  var infoOpen = document.getElementById('info_open');
  var legend   = document.getElementById('picture_legend');

  Array.prototype.slice.call(document.body.childNodes).forEach(function (node) {
    if (node.nodeType === Node.TEXT_NODE && /Utilisateurs parcourant/i.test(node.textContent)) {
      var next = node.nextSibling;
      node.remove();
      while (next && (next.nodeName === 'A' || next.nodeName === 'BR' || next.nodeType === Node.TEXT_NODE)) {
        var toRemove = next;
        next = next.nextSibling;
        toRemove.remove();
      }
    }
  });

  if (infoOpen) {
    var isLoggedIn = (typeof _userdata !== 'undefined' && _userdata['session_logged_in']);
    var permsText  = infoOpen.textContent || '';
    var guestCantPost = /ne pouvez pas poster/i.test(permsText);
    if (!isLoggedIn && guestCantPost) {
      var notice = document.createElement('p');
      notice.className = 'forum-guest-notice';
      notice.textContent = "Vous devez être inscrit·e et connecté·e pour poster dans ce forum.";
      infoOpen.parentNode.replaceChild(notice, infoOpen);
    } else {
      infoOpen.remove();
    }
  }

  if (legend) { legend.remove(); }
})();

/* ── Page Sujet (viewtopic) ──────────────────────────────────────────────── */
(function selViewtopicTransform() {
  var qrCheck = document.getElementById('quick_reply') || document.getElementById('sel-topic-posts');
  if (!qrCheck) { return; }

  var qr = document.getElementById('quick_reply');
  if (qr && typeof _userdata !== 'undefined' && _userdata['session_logged_in'] && _userdata['avatar_link']) {
    var sceditorBox = qr.querySelector('.sceditor-container') || qr.querySelector('textarea');
    if (sceditorBox && !qr.querySelector('.sel-qr-avatar')) {
      var row = document.createElement('div');
      row.className = 'sel-qr-row';
      var avatarBox = document.createElement('div');
      avatarBox.className = 'sel-qr-avatar';
      var avatarImg = document.createElement('img');
      avatarImg.src = _userdata['avatar_link'];
      avatarImg.alt = '';
      avatarImg.loading = 'lazy';
      avatarBox.appendChild(avatarImg);
      sceditorBox.parentNode.insertBefore(row, sceditorBox);
      row.appendChild(avatarBox);
      row.appendChild(sceditorBox);

      var qrBtns = Array.prototype.slice.call(qr.querySelectorAll('input[type="submit"]'));
      if (qrBtns.length) {
        var actionsDiv = document.createElement('div');
        actionsDiv.className = 'sel-qr-actions';
        for (var bi = 0; bi < qrBtns.length; bi++) {
          var btn = qrBtns[bi];
          var label = btn.value || btn.name || '';
          var wrap = document.createElement('span');
          wrap.className = 'sel-qr-btn-wrap';
          wrap.setAttribute('data-label', label);
          wrap.appendChild(btn);
          actionsDiv.appendChild(wrap);
        }
        avatarBox.appendChild(actionsDiv);
      }
    }
  }

  var topicPathEl = document.querySelector('.sub-header-path');
  if (topicPathEl) {
    Array.prototype.forEach.call(topicPathEl.childNodes, function (node) {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent = node.textContent.replace(/::/g, '☽');
      }
    });
  }

  if (qr) {
    var textarea = qr.querySelector('textarea[name="message"]') || qr.querySelector('textarea');
    if (textarea) {
      var counter = document.createElement('div');
      counter.className = 'sel-word-counter';
      counter.textContent = '0 mots';
      qr.appendChild(counter);

      var scStyleInjected = false;

      var setCount = function (text) {
        var t = (text || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        var nb = t ? t.split(' ').length : 0;
        counter.textContent = nb + ' mot' + (nb === 1 ? '' : 's');
      };

      var getText = function () {
        if (window.jQuery) {
          var inst = window.jQuery(textarea).data('sceditor');
          if (inst && typeof inst.val === 'function') {
            var tmp = document.createElement('div');
            tmp.innerHTML = inst.val() || '';
            return tmp.textContent || tmp.innerText || '';
          }
        }
        var scFrame = document.querySelector('.sceditor-container iframe');
        if (scFrame) {
          var doc = scFrame.contentDocument || (scFrame.contentWindow && scFrame.contentWindow.document);
          if (doc && doc.body) {
            if (!scStyleInjected && doc.head) {
              var st = doc.createElement('style');
              st.textContent = 'body{scrollbar-width:thin;scrollbar-color:rgba(212,163,115,0.5) transparent}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(212,163,115,0.45);border-radius:4px}::-webkit-scrollbar-thumb:hover{background:rgba(212,163,115,0.7)}';
              doc.head.appendChild(st);
              scStyleInjected = true;
            }
            return doc.body.innerText || doc.body.textContent || '';
          }
        }
        return textarea.value || '';
      };

      textarea.addEventListener('input', function () { setCount(textarea.value); });
      setInterval(function () { setCount(getText()); }, 300);
    }
  }

  /* 2. Cache le titre dans le premier post (déjà affiché dans le h2 de la page) */
  var firstPost = document.querySelector('#sel-topic-posts .post');
  if (firstPost) {
    var postSubject = firstPost.querySelector('.post-subject, h3.post-subject, .topic-title');
    if (postSubject) { postSubject.style.display = 'none'; }
  }

  /* 3. Lien permalink sur les numéros de réponse (#1, #2…) */
  document.querySelectorAll('#sel-topic-posts .post').forEach(function (post) {
    var numEl = post.querySelector('.post-number, .post-header .post-num, [class*="post-num"]');
    if (!numEl) {
      /* Fallback : cherche un élément dont le texte est "#N" */
      var allSpans = post.querySelectorAll('.post-header span, .post-header a, .post-info span');
      for (var si = 0; si < allSpans.length; si++) {
        if (/^#\d+$/.test((allSpans[si].textContent || '').trim())) { numEl = allSpans[si]; break; }
      }
    }
    if (!numEl) return;
    /* Le lien permalink est souvent un <a> avec href contenant "#p" dans le même header */
    var permaA = post.querySelector('.post-header a[href*="#p"], a.permalink, a[title*="ien"], a[href*="post_id"]');
    if (!permaA) {
      /* Tente de trouver le post_id depuis l'id de l'élément post lui-même */
      var postId = post.id ? post.id.replace(/\D/g, '') : '';
      if (postId) {
        var newA = document.createElement('a');
        newA.href = '#p' + postId;
        newA.textContent = numEl.textContent;
        newA.className = numEl.className + ' sel-post-num-link';
        numEl.parentNode.replaceChild(newA, numEl);
      }
      return;
    }
    if (numEl.tagName !== 'A') {
      var wrapA = document.createElement('a');
      wrapA.href = permaA.href;
      wrapA.textContent = numEl.textContent;
      wrapA.className = 'sel-post-num-link';
      numEl.parentNode.replaceChild(wrapA, numEl);
    }
  });

  document.querySelectorAll('#sel-topic-posts .post').forEach(function (post) {
    var rankDiv = post.querySelector('.sel-post-rank');
    if (!rankDiv) return;

    /* 4. Cache le rang si le bloc est vide */
    if (!rankDiv.textContent.trim() && !rankDiv.querySelector('img')) {
      rankDiv.style.display = 'none';
      return;
    }

    var btnGroup = document.createElement('span');
    btnGroup.className = 'sel-rank-actions';

    var avatarDiv = post.querySelector('.postprofile-avatar[data-id]');
    var posterId = avatarDiv ? avatarDiv.getAttribute('data-id') : '';
    var isOwnPost = (typeof _userdata !== 'undefined' && _userdata['user_id'] && String(_userdata['user_id']) === String(posterId));
    if (posterId && !isOwnPost) {
      var mpBtn = document.createElement('a');
      mpBtn.href = '/privmsg?mode=post&u=' + posterId;
      mpBtn.className = 'sel-rank-btn';
      mpBtn.title = 'Envoyer un message privé';
      mpBtn.textContent = 'MP';
      btnGroup.appendChild(mpBtn);
    }

    var cfLabels = ['Relations', 'Fiche'];
    var cfIdx = 0;
    try {
      var allCfLinks = [];
      post.querySelectorAll('.sel-cf a').forEach(function (a) { allCfLinks.push({el: a, href: a.getAttribute('href')}); });
      post.querySelectorAll('.sel-pf').forEach(function (pf) {
        var valEl = pf.querySelector('.sel-pf-val');
        if (!valEl) return;
        var linkEl = valEl.querySelector('a');
        if (linkEl && linkEl.getAttribute('href')) { allCfLinks.push({el: linkEl, href: linkEl.getAttribute('href'), pf: pf}); return; }
        var rawTxt = valEl.textContent.trim();
        if (/^https?:\/\//.test(rawTxt)) { allCfLinks.push({el: valEl, href: rawTxt, pf: pf}); }
      });
      for (var ci = 0; ci < allCfLinks.length; ci++) {
        var cfEntry = allCfLinks[ci];
        var cfLink = cfEntry.el;
        var href = cfEntry.href;
        if (!href || href === '' || href === '#') continue;
        var rawLabel = '';
        var pfRef = cfEntry.pf || null;
        if (pfRef) {
          var lbl = pfRef.querySelector('.sel-pf-label');
          if (lbl) rawLabel = lbl.textContent.trim().replace(/\s*:$/, '');
        }
        if (!rawLabel) rawLabel = (cfLink.getAttribute && cfLink.getAttribute('title')) || '';
        if (!rawLabel) {
          var imgEl2 = cfLink.querySelector && cfLink.querySelector('img');
          if (imgEl2) rawLabel = imgEl2.getAttribute('alt') || imgEl2.getAttribute('title') || '';
        }
        var lower = rawLabel.toLowerCase();
        var btnText = lower.indexOf('fiche') !== -1 || lower.indexOf('perso') !== -1 ? 'Fiche'
                    : lower.indexOf('elation') !== -1 ? 'Relations'
                    : cfLabels[cfIdx] || rawLabel || 'Lien';
        var cfBtn = document.createElement('a');
        cfBtn.href = href;
        cfBtn.target = '_blank';
        cfBtn.rel = 'nofollow noopener';
        cfBtn.className = 'sel-rank-btn';
        cfBtn.title = rawLabel || btnText;
        cfBtn.textContent = btnText;
        btnGroup.appendChild(cfBtn);
        cfIdx++;
      }
    } catch (e) { /* silencieux */ }

    post.querySelectorAll('.sel-pf').forEach(function (pf) {
      var valEl = pf.querySelector('.sel-pf-val');
      if (!valEl) return;
      var txt = valEl.textContent.trim();
      if (/^https?:\/\//.test(txt)) { pf.style.display = 'none'; }
    });

    var iconImg = null;
    post.querySelectorAll('.sel-pf').forEach(function (pf) {
      if (iconImg) return;
      var lbl = pf.querySelector('.sel-pf-label');
      if (!lbl) return;
      if (/icon/i.test(lbl.textContent)) {
        var img = pf.querySelector('img');
        if (img) {
          iconImg = document.createElement('img');
          iconImg.src = img.getAttribute('src') || '';
          iconImg.alt = img.getAttribute('alt') || '';
          iconImg.className = 'sel-rank-icon';
          iconImg.loading = 'lazy';
          pf.style.display = 'none';
        }
      }
    });

    var rankRow = document.createElement('div');
    rankRow.className = 'sel-rank-row';
    rankDiv.parentNode.insertBefore(rankRow, rankDiv);
    rankRow.appendChild(rankDiv);
    if (btnGroup.children.length || iconImg) {
      if (btnGroup.children.length) { rankRow.appendChild(btnGroup); }
      if (iconImg) { rankRow.appendChild(iconImg); }
    }
  });

  /* Nettoyage bas de page viewtopic */
  var vtIsLoggedIn = typeof _userdata !== 'undefined' && !!_userdata['session_logged_in'];

  var jumpboxFs = document.querySelector('fieldset.jumpbox');
  if (jumpboxFs && jumpboxFs.closest('form')) { jumpboxFs.closest('form').remove(); }

  var permBlock = document.querySelector('.block.forum-width');
  if (permBlock) {
    if (vtIsLoggedIn) {
      permBlock.remove();
    } else {
      Array.prototype.slice.call(permBlock.querySelectorAll('li, p, dd')).forEach(function (el) {
        if (!/ne\s+pouvez?\s+pas|interdit|n.est\s+pas\s+autoris/i.test(el.textContent)) {
          el.remove();
        }
      });
      if (!permBlock.querySelector('li, p, dd')) { permBlock.remove(); }
    }
  }

  var svgFor = function (label) {
    var t = (label || '').toLowerCase();
    if (/verrou/.test(t) && !/deverrou/.test(t)) return '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/></svg>';
    if (/deverrou|ouvrir/.test(t)) return '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M11 1a2 2 0 0 0-2 2v4a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h5V3a3 3 0 0 1 6 0v4a.5.5 0 0 1-1 0V3a2 2 0 0 0-2-2z"/></svg>';
    if (/suppr|delet/.test(t)) return '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>';
    if (/depla|move/.test(t)) return '<svg viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L10.293 7.5H4.5z"/></svg>';
    if (/epin|stick|annonce/.test(t)) return '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M4.146.146A.5.5 0 0 1 4.5 0h7a.5.5 0 0 1 .5.5c0 .68-.342 1.174-.646 1.479-.126.125-.25.224-.354.298v4.431l.078.048c.203.127.476.314.751.555C12.36 7.775 13 8.527 13 9.5a.5.5 0 0 1-.5.5h-4v4.5c0 .276-.224 1.5-.5 1.5s-.5-1.224-.5-1.5V10h-4a.5.5 0 0 1-.5-.5c0-.973.64-1.725 1.17-2.189A5.921 5.921 0 0 1 5 6.708V2.277a2.77 2.77 0 0 1-.354-.298C4.342 1.674 4 1.179 4 .5a.5.5 0 0 1 .146-.354z"/></svg>';
    if (/fus|merg/.test(t)) return '<svg viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M1 11.5a.5.5 0 0 0 .5.5h11.793l-3.147 3.146a.5.5 0 0 0 .708.708l4-4a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 11H1.5a.5.5 0 0 0-.5.5zm14-7a.5.5 0 0 1-.5.5H2.707l3.147 3.146a.5.5 0 1 1-.708.708l-4-4a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 4H14.5a.5.5 0 0 1 .5.5z"/></svg>';
    return '<svg viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="2"/><circle cx="8" cy="3" r="1.5"/><circle cx="8" cy="13" r="1.5"/></svg>';
  };

  var modCombined = null;
  var modBtns = document.createElement('div');
  modBtns.className = 'sel-mod-buttons';
  var seenTitles = {};

  var topicAdminP = document.querySelector('p.right.forum-width');
  if (topicAdminP) {
    Array.prototype.slice.call(topicAdminP.querySelectorAll('a, button')).forEach(function (link) {
      var lbl = (link.title || link.getAttribute('aria-label') || link.textContent || '').trim();
      var key = lbl.toLowerCase().replace(/\s+/g, '').substring(0, 12);
      if (key && seenTitles[key]) return;
      if (key) seenTitles[key] = true;
      link.className = 'sel-mod-btn';
      if (lbl) link.title = lbl;
      modBtns.appendChild(link);
    });
    topicAdminP.remove();
  }

  /* Retire le formulaire quickmod (select FA) sans le convertir en icônes
     car S_TOPIC_ADMIN fournit déjà les mêmes actions sous forme de liens */
  var quickmodFs = document.querySelector('fieldset.quickmod');
  if (quickmodFs) {
    var modForm2 = quickmodFs.closest('form');
    if (modForm2) { modForm2.remove(); } else { quickmodFs.remove(); }
  }

  /* Lien vers le panneau d'administration (si admin) :
     p.right.forum-width (S_TOPIC_ADMIN) ne s'affiche que pour les mods/admins,
     donc sa présence initiale dans le DOM est un indicateur fiable du statut admin.
     On a déjà capturé topicAdminP plus haut — s'il existait, l'utilisateur est admin. */
  var isAdmin = !!topicAdminP;

  if (modBtns.children.length || isAdmin) {
    modCombined = document.createElement('div');
    modCombined.className = 'sel-mod-combined forum-width';
    var modLbl = document.createElement('span');
    modLbl.className = 'sel-mod-label';
    modLbl.textContent = 'Modération';
    modCombined.appendChild(modLbl);
    if (modBtns.children.length) { modCombined.appendChild(modBtns); }
    if (isAdmin) {
      var adminBtn = document.createElement('a');
      adminBtn.href = window.location.origin + '/admin';
      adminBtn.className = 'sel-mod-btn sel-admin-btn';
      adminBtn.title = 'Panneau d\'administration';
      adminBtn.innerHTML = '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/></svg>';
      modCombined.appendChild(adminBtn);
    }
    var afterQr = document.getElementById('sel-quickreply') || document.getElementById('quick_reply');
    if (afterQr && afterQr.parentNode) {
      afterQr.parentNode.insertBefore(modCombined, afterQr.nextSibling);
    } else {
      document.body.appendChild(modCombined);
    }
  }
})();

/* ── Pied de page (toutes les pages) ─────────────────────────────────────── */
(function selBuildSiteFooter() {
  var bodyNodes = Array.prototype.slice.call(document.body.childNodes);
  var footerStart = -1;
  for (var fi = 0; fi < bodyNodes.length; fi++) {
    if (bodyNodes[fi].nodeType === Node.COMMENT_NODE && /overall_footer_begin/i.test(bodyNodes[fi].textContent || '')) {
      footerStart = fi;
      break;
    }
  }
  if (footerStart === -1) { return; }

  var legalBar = document.createElement('div');
  legalBar.className = 'site-footer-bar forum-width';
  var legalLinks = [];
  for (var i = footerStart + 1; i < bodyNodes.length; i++) {
    var fn = bodyNodes[i];
    if (fn.nodeName === 'A' || fn.nodeName === 'STRONG' || (fn.nodeName === 'SPAN' && fn.classList.contains('gensmall'))) {
      fn.style.order = '';
      legalLinks.push(fn);
    } else if (fn.nodeName === 'SCRIPT' || fn.nodeName === 'IFRAME' || fn.nodeName === 'DIV') {
      break;
    } else {
      fn.remove();
    }
  }
  legalLinks.forEach(function (el, idx) {
    if (idx > 0) { legalBar.appendChild(document.createTextNode(' | ')); }
    legalBar.appendChild(el);
  });
  /* Lien admin en fin de barre légale */
  /* Admin détecté par présence du lien /admin dans la navbar */
  var footerIsAdmin = false;
  var allPageLinks2 = document.querySelectorAll('a');
  for (var ali2 = 0; ali2 < allPageLinks2.length; ali2++) {
    var alHref2 = allPageLinks2[ali2].getAttribute('href') || '';
    if (/\/admin(\/|$|\?|#|\.)/i.test(alHref2) || alHref2 === window.location.origin + '/admin') { footerIsAdmin = true; break; }
  }
  if (footerIsAdmin) {
    legalBar.appendChild(document.createTextNode(' | '));
    var footerAdminA = document.createElement('a');
    footerAdminA.href = window.location.origin + '/admin';
    footerAdminA.textContent = 'Administration';
    footerAdminA.className = 'sel-footer-admin';
    legalBar.appendChild(footerAdminA);
  }
  if (!legalBar.childNodes.length) { return; }

  var footer = document.createElement('footer');
  footer.className = 'site-footer forum-width';

  var partners = document.createElement('div');
  partners.className = 'site-footer-partners';
  var partnersTitle = document.createElement('h3');
  partnersTitle.className = 'site-footer-partners-title';
  partnersTitle.textContent = 'Nos partenaires';
  var partnersGrid = document.createElement('div');
  partnersGrid.className = 'site-footer-partners-grid';
  var partnerPlaceholderSrc = 'https://2img.net/i.imgur.com/21QSwFx.png';
  for (var pi = 0; pi < 8; pi++) {
    var partnerLink = document.createElement('a');
    partnerLink.className = 'partner-square';
    partnerLink.href = '#';
    var partnerImg = document.createElement('img');
    partnerImg.src = partnerPlaceholderSrc;
    partnerImg.alt = 'Partenaire';
    partnerImg.loading = 'lazy';
    partnerLink.appendChild(partnerImg);
    partnersGrid.appendChild(partnerLink);
  }
  partners.appendChild(partnersTitle);
  partners.appendChild(partnersGrid);

  footer.appendChild(partners);
  footer.appendChild(legalBar);
  document.body.appendChild(footer);
  footer.style.order = 9999;
})();

/* ── Avatars manquants dans "dernier message" ────────────────────────────── */
(function selFillMissingLastpostAvatars() {
  setTimeout(function () {
    document.querySelectorAll('.lm-right').forEach(function (lmRight) {
      if (lmRight.dataset.avatarChecked || lmRight.querySelector('.lm-avatar-clip')) { return; }
      lmRight.dataset.avatarChecked = '1';
      var lmBody = lmRight.previousElementSibling;
      if (!lmBody || !lmBody.classList.contains('lm-body')) { return; }
      var authorLink = lmBody.querySelector('.lm-author a[href^="/u"]');
      if (!authorLink) { return; }
      fetch(authorLink.getAttribute('href'))
        .then(function (res) { return res.text(); })
        .then(function (html) {
          if (lmRight.querySelector('.lm-avatar-clip')) { return; }
          var avatarImg = new DOMParser().parseFromString(html, 'text/html').querySelector('.mod-login-avatar img');
          if (!avatarImg) { return; }
          var clip = document.createElement('div');
          clip.className = 'lm-avatar-clip';
          var img = document.createElement('img');
          img.src = avatarImg.getAttribute('src');
          img.alt = avatarImg.getAttribute('alt') || '';
          img.loading = 'lazy';
          clip.appendChild(img);
          lmRight.insertBefore(clip, lmRight.firstChild);
        })
        .catch(function () {});
    });
  }, 1500);
})();

/* ── Page d'envoi de message (/post) ────────────────────────────────────── */
(function selPostingPageTransform() {
  if (!document.getElementById('postingbox')) { return; }

  document.body.classList.add('sel-post-page');

  /* Breadcrumb construit depuis document.title (FA met la hiérarchie avec ::) */
  var bcNav = document.getElementById('sel-posting-breadcrumb');
  if (bcNav) {
    var titleText = document.title || '';
    var bcParts   = titleText.split('::').map(function (s) { return s.trim(); }).filter(Boolean);
    if (bcParts.length > 1) {
      /* FA order : "Action :: Topic :: Forum :: Site" → on affiche de droite à gauche */
      bcParts.reverse();
      bcParts.forEach(function (part, i) {
        if (i > 0) {
          var sep = document.createElement('span');
          sep.className = 'sel-bc-sep';
          sep.textContent = ' ☽ ';
          bcNav.appendChild(sep);
        }
        var span = document.createElement('span');
        span.className = (i === bcParts.length - 1) ? 'sel-bc-current' : 'sel-bc-part';
        span.textContent = part;
        bcNav.appendChild(span);
      });
    } else {
      /* Fallback : juste le nom du site */
      var siteSpan = document.createElement('span');
      siteSpan.className = 'sel-bc-part';
      siteSpan.textContent = window.location.hostname.replace('www.', '').split('.')[0];
      bcNav.appendChild(siteSpan);
    }
  }

  /* Smileys : popup absolu positionné sous le bouton toolbar */
  var smileyBox = document.getElementById('smiley-box');
  if (smileyBox) {
    /* Déplacer dans <body> pour positionnement absolu libre */
    document.body.appendChild(smileyBox);
    smileyBox.className = 'sel-smiley-popup';

    var injectSmileyBtn = function () {
      var toolbar = document.querySelector('.sceditor-toolbar');
      if (!toolbar) { return false; }
      if (toolbar.querySelector('.sel-smiley-btn')) { return true; }

      var group = document.createElement('div');
      group.className = 'sceditor-group';
      var btn = document.createElement('a');
      btn.className = 'sceditor-button sel-smiley-btn';
      btn.setAttribute('unselectable', 'on');
      btn.title = 'Smileys';
      var inner = document.createElement('div');
      inner.setAttribute('unselectable', 'on');
      btn.appendChild(inner);

      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var isOpen = smileyBox.classList.toggle('sel-open');
        if (isOpen) {
          var rect = btn.getBoundingClientRect();
          var editorEl = document.querySelector('#postingbox .sceditor-container') || document.getElementById('postingbox');
          var editorW  = editorEl ? editorEl.offsetWidth : 600;
          smileyBox.style.top   = (rect.bottom + window.scrollY + 4) + 'px';
          smileyBox.style.left  = rect.left + 'px';
          smileyBox.style.width = Math.max(280, Math.floor(editorW * 0.5)) + 'px';
        }
      });

      document.addEventListener('click', function (e) {
        if (!smileyBox.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
          smileyBox.classList.remove('sel-open');
        }
      });

      group.appendChild(btn);
      toolbar.appendChild(group);
      return true;
    };

    var smileyInterval = setInterval(function () {
      if (injectSmileyBtn()) { clearInterval(smileyInterval); }
    }, 100);
  }

  /* Prévisualisation : peupler avatar + pseudo */
  var populatePreview = function () {
    var preview = document.getElementById('preview');
    if (!preview) { return; }

    var avatarEl = preview.querySelector('.sel-preview-avatar');
    var unameEl  = preview.querySelector('.sel-preview-uname');
    var username = (typeof _userdata !== 'undefined') ? (_userdata['username'] || '') : '';

    if (unameEl && username) { unameEl.textContent = username; }

    if (avatarEl && !avatarEl.querySelector('img')) {
      var avatarSrc = '';

      /* 1. Champs _userdata (chemin relatif ou URL absolue) */
      if (typeof _userdata !== 'undefined') {
        var ua = _userdata['user_avatar'] || _userdata['avatar_full'] || _userdata['avatar'] || '';
        if (ua) {
          avatarSrc = /^https?:\/\//.test(ua) ? ua : window.location.origin + '/' + ua.replace(/^\//, '');
        }
      }

      /* 2. Chercher dans n'importe quel post visible sur la page */
      if (!avatarSrc && username) {
        var allPostNames = document.querySelectorAll('.postprofile-name strong');
        for (var pni = 0; pni < allPostNames.length; pni++) {
          if (allPostNames[pni].textContent.trim() === username) {
            var postEl  = allPostNames[pni].closest('.post');
            var avatImg = postEl && postEl.querySelector('.postprofile-avatar img');
            if (avatImg) { avatarSrc = avatImg.src; break; }
          }
        }
      }

      if (avatarSrc) {
        var avImg = document.createElement('img');
        avImg.src = avatarSrc;
        avImg.alt = '';
        avatarEl.appendChild(avImg);
      }
    }
  };
  populatePreview();
  setTimeout(populatePreview, 600);

  /* Sections collapsibles (Options + Dés) */
  var h3Els = document.querySelectorAll('.h3.forum-hideable.forum-width');
  Array.prototype.forEach.call(h3Els, function (h3) {
    var panel = h3.nextElementSibling;
    if (!panel || !panel.classList.contains('panel')) { return; }

    /* Flèche */
    var arrow = document.createElement('span');
    arrow.className = 'sel-collapse-arrow';
    h3.appendChild(arrow);
    h3.style.cursor = 'pointer';

    var txt = (h3.textContent || '').toLowerCase();
    var isDice = /d[eé]|lancer|dice/i.test(txt);

    var doCollapse = function () {
      panel.classList.add('sel-collapsed');
      arrow.textContent = ' ▶';
    };
    var doExpand = function () {
      panel.classList.remove('sel-collapsed');
      arrow.textContent = ' ▼';
    };

    if (isDice) { doCollapse(); } else { doExpand(); }

    h3.addEventListener('click', function () {
      if (panel.classList.contains('sel-collapsed')) { doExpand(); } else { doCollapse(); }
    });
  });

  /* Revue du sujet : trouver l'élément post-form, centrer + simplifier */
  var postForm = document.querySelector('form[name="post"]');
  if (postForm) {
    var reviewEl = postForm.nextElementSibling;
    while (reviewEl) {
      /* Sauter les divs cachés (find_username, etc.) */
      if (reviewEl.tagName === 'DIV' && reviewEl.style.display !== 'none' && reviewEl.id !== 'find_username' && reviewEl.id !== 'group_pm_explain') {
        reviewEl.classList.add('forum-width', 'sel-post-topic-review');
        break;
      }
      reviewEl = reviewEl.nextElementSibling;
    }
  }

  /* Compteur de mots */
  var textarea = document.getElementById('text_editor_textarea') || document.querySelector('#postingbox textarea[name="message"]');
  if (textarea) {
    var counter = document.createElement('div');
    counter.className = 'sel-word-counter';
    counter.textContent = '0 mots';
    var actionsEl = document.querySelector('.sel-post-actions');
    if (actionsEl) {
      actionsEl.insertBefore(counter, actionsEl.firstChild);
    } else {
      var scCont = document.querySelector('#postingbox .sceditor-container');
      if (scCont && scCont.parentNode) { scCont.parentNode.insertBefore(counter, scCont.nextSibling); }
    }

    var setCount = function (text) {
      var t = (text || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      var nb = t ? t.split(' ').length : 0;
      counter.textContent = nb + ' mot' + (nb === 1 ? '' : 's');
    };
    var getText = function () {
      if (window.jQuery) {
        var inst = window.jQuery(textarea).data('sceditor');
        if (inst && typeof inst.val === 'function') {
          var tmp = document.createElement('div');
          tmp.innerHTML = inst.val() || '';
          return tmp.textContent || tmp.innerText || '';
        }
      }
      return textarea.value || '';
    };
    textarea.addEventListener('input', function () { setCount(textarea.value); });
    setInterval(function () { setCount(getText()); }, 300);
  }
})();

/* ── Page d'accueil (index) ──────────────────────────────────────────────── */

(function selHomeSidebar() {
  if (!document.getElementById('selHomeSidebar')) { return; }
  function faHref(part) {
    var a = document.querySelector('#sel-fa-nav a[href*="' + part + '"]');
    return a ? a.getAttribute('href') : '#';
  }
  function selFindActiveName() {
    var uiWords = ['anonymous', 'associer', 'ajouter', 'personnage', 'compte', 'connect'];
    function isUi(t) {
      var l = t.toLowerCase();
      for (var i = 0; i < uiWords.length; i++) { if (l.indexOf(uiWords[i]) !== -1) { return true; } }
      return false;
    }
    var uname = '';
    var sw = document.getElementById('switcheroo');
    if (sw) {
      var walker = document.createTreeWalker(sw, 4, null, false);
      var nd;
      while ((nd = walker.nextNode())) {
        var tv = nd.nodeValue.trim();
        if (tv.length > 2 && !isUi(tv)) { uname = tv; break; }
      }
    }
    if (!uname) {
      try {
        var ud = (typeof _userdata !== 'undefined') ? _userdata : null;
        if (ud && ud['username'] && !isUi(String(ud['username']))) { uname = String(ud['username']); }
      } catch (ex) { uname = ''; }
    }
    return uname;
  }
  /* Nom du COMPTE FA réellement connecté (pas le personnage actif dans le
     switcheroo, qui peut différer si on utilise un gestionnaire de
     multi-comptes) — utilisé pour l'en-tête de la colonne, qui porte les
     actions du compte (déconnexion, profil...).
     {USERNAME} s'est révélé vide dans ce contexte de template FA ; on
     utilise donc en priorité _userdata, la variable JS globale que FA
     injecte lui-même avec les infos de session (déjà utilisée comme
     repli dans selFindActiveName). */
  function selGetAccountUsername() {
    try {
      if (typeof _userdata !== 'undefined' && _userdata && _userdata['username']) {
        return String(_userdata['username']);
      }
    } catch (ex) { /* ignore */ }
    var el = document.getElementById('sel-session-username');
    var t = el ? el.textContent.trim() : '';
    return t || selFindActiveName();
  }
  /* setAttribute défensif : si l'id n'existe pas (ex. template FA pas à
     jour), on ignore plutôt que de planter et de couper le reste du
     script (tout ce qui suit selHomeSidebar() dans ce fichier). */
  function setHref(id, href) {
    var el = document.getElementById(id);
    if (el) { el.setAttribute('href', href); }
  }
  function selHomeSidebarState() {
    var loggedIn = !!document.querySelector('#sel-fa-nav a[href*="logout"]');
    var guestEl = document.getElementById('selHomeHeadGuest');
    var userEl = document.getElementById('selHomeHeadUser');
    if (!guestEl || !userEl) { return; }
    if (!loggedIn) {
      guestEl.style.display = '';
      userEl.style.display = 'none';
      setHref('selHomeLogin', faHref('login'));
      setHref('selHomeRegister', faHref('register'));
      return;
    }
    guestEl.style.display = 'none';
    userEl.style.display = '';
    var editHref = faHref('profile');
    setHref('selHomeLogout', faHref('logout'));
    setHref('selHomeEditProfile', editHref);
    setHref('selHomeViewProfile', editHref.split('?')[0]);
    setHref('selHomeNewTopics', '/search?search_id=newposts');
    var name = selGetAccountUsername();
    var nameEl = document.getElementById('selHomeCharName');
    if (name && nameEl) { nameEl.textContent = name; }
    var sw = document.getElementById('switcheroo');
    var slot = document.getElementById('selHomeSwitcherooSlot');
    if (sw && slot && sw.parentNode !== slot) {
      slot.appendChild(sw);
      sw.style.display = '';
    }
    var iconRow = document.getElementById('selHomeIconRow');
    if (iconRow) { iconRow.style.display = ''; }
    var notifBtn = document.getElementById('notiffi_button');
    if (iconRow && notifBtn && notifBtn.parentNode !== iconRow) {
      iconRow.insertBefore(notifBtn, iconRow.firstChild);
    }
    var pmLink = document.getElementById('selHomeMessages');
    var pmA = document.querySelector('#sel-fa-nav a[href*="privmsg"]');
    if (pmLink && pmA) {
      pmLink.style.display = '';
      pmLink.setAttribute('href', pmA.getAttribute('href'));
      var badge = document.getElementById('selHomeMessagesBadge');
      if (badge) {
        var m = ((pmA.textContent || '') + ' ' + (pmA.getAttribute('title') || '')).match(/\d+/);
        badge.textContent = m ? m[0] : '';
      }
    }
  }
  function selHomeCollapseToggle() {
    document.documentElement.classList.toggle('sel-sidebar-collapsed');
  }
  function selHomePositionNotifPanel() {
    var btn = document.getElementById('notiffi_button');
    var panel = document.getElementById('notiffi_panel');
    if (!btn || !panel) { return; }
    var r = btn.getBoundingClientRect();
    panel.style.top = (r.bottom + 8) + 'px';
    panel.style.left = r.left + 'px';
    panel.style.right = 'auto';
  }
  function onClick(id, handler) {
    var el = document.getElementById(id);
    if (el) { el.addEventListener('click', handler); }
  }
  function selHomeBindOnce() {
    onClick('selHomeCollapseBtn', selHomeCollapseToggle);
    onClick('selHomeReopenBtn', selHomeCollapseToggle);
    onClick('selHomeScrim', function() {
      document.documentElement.classList.remove('sel-sidebar-collapsed');
    });
    document.querySelectorAll('.sel-home-navtoggle').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var row = document.getElementById(btn.getAttribute('data-target'));
        if (row) { row.classList.toggle('is-collapsed'); }
      });
    });
    onClick('selHomeScrollTop', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    onClick('selHomeScrollBottom', function() {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    });
    /* Le panneau Notiffi (340px) déborderait de la colonne (320px) une
       fois déplacé ici : repositionné en fixed, calé sur le bouton, à
       chaque clic (ouverture ou fermeture, sans effet visible si fermé). */
    var notifTrigger = document.querySelector('#notiffi_button .ntf_button-text') || document.getElementById('notiffi_button');
    if (notifTrigger) { notifTrigger.addEventListener('click', selHomePositionNotifPanel); }
    window.addEventListener('resize', selHomePositionNotifPanel);
    if (window.matchMedia && window.matchMedia('(max-width: 1049px)').matches) {
      document.documentElement.classList.add('sel-sidebar-collapsed');
    }
  }
  selHomeBindOnce();
  selHomeSidebarState();
  window.addEventListener('load', selHomeSidebarState);
  setTimeout(selHomeSidebarState, 800);
})();

(function selHomeCarousel() {
  var current = 0;
  var slides = document.querySelectorAll('.sel-slide');
  var dots   = document.querySelectorAll('.sel-dot');
  if (!slides.length) return;
  function goTo(n) {
    slides[current].classList.remove('active'); dots[current].classList.remove('active');
    current = (n + slides.length) % slides.length;
    slides[current].classList.add('active'); dots[current].classList.add('active');
  }
  document.getElementById('sel-next').onclick = function() { goTo(current + 1); };
  document.getElementById('sel-prev').onclick = function() { goTo(current - 1); };
  dots.forEach(function(d) { d.onclick = function() { goTo(+d.getAttribute('data-i')); }; });
  setInterval(function() { goTo(current + 1); }, 5000);
})();

(function selHomeMoonPhase() {
  var css = '#sel-moon-phase{background:#252a3a !important;border-radius:14px !important;padding:16px 18px 14px !important;color:#c8cfe0 !important;width:100% !important;max-width:none !important;position:relative !important;overflow:hidden !important;font-family:Inter,sans-serif !important;box-sizing:border-box !important;display:flex !important;flex-direction:column !important;}'
    +'#lune-glow{position:absolute;top:-50px;right:-50px;width:140px;height:140px;pointer-events:none;border-radius:50%;}'
    +'#lune-header{font-size:9px;letter-spacing:0.07em;color:rgba(160,170,200,0.35);margin-bottom:10px;}'
    +'#lune-badge{display:inline-flex;align-items:center;gap:6px;font-size:10px;font-weight:600;letter-spacing:0.08em;padding:3px 9px;border-radius:99px;margin-bottom:13px;}'
    +'#lune-main{display:flex;align-items:flex-start;gap:13px;margin-bottom:13px;}'
    +'#lune-icon{flex-shrink:0;width:48px;height:48px;display:flex;align-items:center;justify-content:center;}'
    +'#lune-step-name{font-family:"Cormorant Garamond",serif !important;font-size:15px;font-weight:400;font-style:italic;color:#c8cfe0;letter-spacing:0.02em;margin-bottom:6px;}'
    +'#lune-step-desc{font-size:11px;color:rgba(180,185,210,0.5);line-height:1.5;max-height:44px;overflow-y:auto;scrollbar-width:thin;scrollbar-color:rgba(180,170,230,0.2) transparent;}'
    +'#lune-sep{height:1px;background:rgba(255,255,255,0.06);margin-bottom:11px;}'
    +'#lune-progress-label{display:flex;justify-content:space-between;font-size:10px;color:rgba(160,170,200,0.35);margin-bottom:5px;letter-spacing:0.03em;}'
    +'#lune-track{background:rgba(255,255,255,0.06);border-radius:99px;height:4px;overflow:hidden;margin-bottom:4px;position:relative;}'
    +'#lune-fill{height:100%;border-radius:99px;position:relative;transition:width 0.4s ease;}'
    +'#lune-fill::after{content:"";position:absolute;right:0;top:0;bottom:0;width:4px;background:rgba(255,255,255,0.55);border-radius:99px;}'
    +'#lune-markers{display:flex;justify-content:space-between;padding:0 1px;margin-bottom:11px;}'
    +'.lune-dot{width:1px;height:4px;background:rgba(255,255,255,0.1);}'
    +'#lune-next{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;}'
    +'#lune-next-label{font-size:10px;color:rgba(160,170,200,0.3);letter-spacing:0.05em;}'
    +'#lune-next-info{display:flex;align-items:center;gap:5px;font-size:11px;color:rgba(190,190,220,0.6);}'
    +'#lune-next-days{font-size:10px;color:rgba(160,170,200,0.3);}'
    +'#lune-footer{border-top:1px solid rgba(255,255,255,0.05);padding-top:9px;display:flex;justify-content:space-between;align-items:center;}'
    +'#lune-link{font-size:9px;color:rgba(160,170,200,0.35);text-decoration:none;letter-spacing:0.04em;white-space:nowrap;}'
    +'.lune-fill-nuit{background:linear-gradient(90deg,#3a3060,#7a6fd0) !important;}'
    +'.lune-fill-jour{background:linear-gradient(90deg,#5a2e10,#c47830) !important;}';
  var s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);

  var container = document.getElementById('sel-moon-phase');
  if (!container) return;
  container.classList.add('sel-cadre-cut', 'sel-cadre-cut--no-left');
  container.innerHTML = '<div id="lune-glow"></div><div id="lune-header">&#x2B21; Face cach&#233;e de la Lune</div><div id="lune-badge"></div><div id="lune-main"><div id="lune-icon"></div><div style="flex:1"><div id="lune-step-name">&#8230;</div><div id="lune-step-desc">&#8230;</div></div></div><div id="lune-sep"></div><div id="lune-progress-label"><span>Progression du cycle</span><span id="lune-pct">0 %</span></div><div id="lune-track"><div id="lune-fill" style="width:0%"></div></div><div id="lune-markers"><div class="lune-dot"></div><div class="lune-dot"></div><div class="lune-dot"></div><div class="lune-dot"></div><div class="lune-dot"></div></div><div id="lune-next"><span id="lune-next-label">PROCHAINE &#201;TAPE &#8594;</span><span id="lune-next-info"><span id="lune-next-glyph" style="font-size:13px"></span> <span id="lune-next-name"></span> <span id="lune-next-days"></span></span></div><div id="lune-footer"><a id="lune-link" href="#">Comprendre les cycles &#8599;</a></div>';

  var YEAR_OFFSET = 46, SYNODIC = 29.53058867;
  function julianDay(date) {
    var y=date.getFullYear(),mo=date.getMonth()+1,d=date.getDate(),a=Math.floor((14-mo)/12),yr=y+4800-a,m=mo+12*a-3;
    return d+Math.floor((153*m+2)/5)+365*yr+Math.floor(yr/4)-Math.floor(yr/100)+Math.floor(yr/400)-32045-0.5;
  }
  function moonPhase(date) { var p=((julianDay(date)-2451550.1)%SYNODIC)/SYNODIC; return p<0?p+1:p; }
  function hiddenPhase(p) { return (p+0.5)%1; }
  var STEPS = {
    jour:[
      {key:'aube',minF:0,maxF:0.2,season:'jour',name:"L'Aube",descs:["La première lueur rase l'horizon.","La lumière arrive en oblique, froide.","Le sol commence à se réchauffer."]},
      {key:'jour_plein',minF:0.2,maxF:0.8,season:'jour',name:'Le Jour Plein',descs:["Le Soleil est haut. La chaleur est sans merci.","Lumière directe, aveuglante.","Le régolite brûle.","Midi lunaire.","La chaleur atteint son pic."]},
      {key:'declin',minF:0.8,maxF:1.0,season:'jour',name:'Le Déclin',descs:["La lumière rougit, les ombres s'allongent.","Le Soleil s'approche de l'horizon.","Dernières heures de chaleur."]}
    ],
    nuit:[
      {key:'nuit_profonde',minF:0,maxF:0.2,season:'nuit',name:'La Nuit Profonde',descs:["Obscurité absolue. Les étoiles seules éclairent.","Pas un photon du Soleil.","Le froid s'installe rapidement."]},
      {key:'nuit_stable',minF:0.2,maxF:0.8,season:'nuit',name:'La Nuit Stable',descs:["Un tapis d'étoiles sans limites.","Le silence et le froid règnent.","Nuit profonde et stable.","Des milliers d'étoiles, immobiles.","La nuit est à son apogée."]},
      {key:'nuit_finissante',minF:0.8,maxF:1.0,season:'nuit',name:'La Nuit Finissante',descs:["Une lueur rasante pointe à l'horizon.","Les étoiles pâlissent à l'est.","La nuit touche à sa fin."]}
    ]
  };
  function svgNuit(){return '<svg width="44" height="44" viewBox="0 0 46 46" fill="none"><circle cx="23" cy="23" r="18" fill="#1a1d2e" stroke="rgba(120,110,190,0.25)" stroke-width="0.75"/><circle cx="23" cy="23" r="13" fill="none" stroke="rgba(120,110,190,0.12)" stroke-width="0.5"/><text x="23" y="28" text-anchor="middle" font-size="17" fill="rgba(160,155,210,0.85)" font-family="Georgia,serif">&#10022;</text><text x="11" y="16" text-anchor="middle" font-size="7" fill="rgba(160,155,210,0.35)" font-family="Georgia,serif">&#10023;</text><text x="36" y="32" text-anchor="middle" font-size="5" fill="rgba(160,155,210,0.25)" font-family="Georgia,serif">&#10022;</text></svg>';}
  function svgJour(){return '<svg width="44" height="44" viewBox="0 0 46 46" fill="none"><line x1="23" y1="2" x2="23" y2="8" stroke="rgba(190,130,70,0.3)" stroke-width="1"/><line x1="23" y1="38" x2="23" y2="44" stroke="rgba(190,130,70,0.3)" stroke-width="1"/><line x1="2" y1="23" x2="8" y2="23" stroke="rgba(190,130,70,0.3)" stroke-width="1"/><line x1="38" y1="23" x2="44" y2="23" stroke="rgba(190,130,70,0.3)" stroke-width="1"/><circle cx="23" cy="23" r="11" fill="#1e1810" stroke="rgba(190,130,70,0.35)" stroke-width="0.75"/><circle cx="23" cy="23" r="7" fill="rgba(190,130,70,0.1)" stroke="rgba(190,130,70,0.22)" stroke-width="0.5"/><circle cx="23" cy="23" r="3" fill="rgba(190,130,70,0.45)"/></svg>';}
  function getStepInfo(hp) {
    var isJour=hp<0.5,season=isJour?'jour':'nuit',fracInSeason=isJour?hp/0.5:(hp-0.5)/0.5,steps=STEPS[season],step=steps[steps.length-1];
    for(var i=0;i<steps.length;i++){if(fracInSeason>=steps[i].minF&&fracInSeason<steps[i].maxF){step=steps[i];break;}}
    var stepRange=step.maxF-step.minF,fracInStep=Math.min((fracInSeason-step.minF)/stepRange,0.9999);
    var descIdx=Math.min(Math.floor(fracInStep*step.descs.length),step.descs.length-1);
    var daysRemaining=(1-fracInStep)*stepRange*(SYNODIC/2);
    var stepIdx=steps.indexOf(step),nextStep=stepIdx<steps.length-1?steps[stepIdx+1]:STEPS[season==='jour'?'nuit':'jour'][0];
    return {step:step,descIdx:descIdx,daysRemaining:daysRemaining,nextStep:nextStep,globalPct:Math.round(hp*100)};
  }
  function render() {
    var now=new Date(),hp=hiddenPhase(moonPhase(now)),info=getStepInfo(hp),step=info.step,season=step.season;
    document.getElementById('lune-glow').style.background='radial-gradient(circle,'+(season==='nuit'?'rgba(110,95,200,0.13)':'rgba(190,110,50,0.12)')+' 0%,transparent 68%)';
    var badge=document.getElementById('lune-badge');
    if(season==='nuit'){badge.style.cssText='display:inline-flex;align-items:center;gap:6px;font-size:10px;font-weight:600;letter-spacing:0.08em;padding:3px 9px;border-radius:99px;margin-bottom:13px;background:rgba(100,90,160,0.2);border:1px solid rgba(130,120,200,0.2);color:#a099d0;';badge.innerHTML='<svg width="9" height="9" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="none" stroke="#a099d0" stroke-width="1"/><circle cx="5" cy="5" r="1.5" fill="#a099d0"/></svg> La Nuit';}
    else{badge.style.cssText='display:inline-flex;align-items:center;gap:6px;font-size:10px;font-weight:600;letter-spacing:0.08em;padding:3px 9px;border-radius:99px;margin-bottom:13px;background:rgba(160,80,40,0.2);border:1px solid rgba(190,110,60,0.2);color:#c49070;';badge.innerHTML='<svg width="9" height="9" viewBox="0 0 10 10"><circle cx="5" cy="5" r="2" fill="#c49070"/><line x1="5" y1="0" x2="5" y2="2.5" stroke="#c49070" stroke-width="1"/><line x1="5" y1="7.5" x2="5" y2="10" stroke="#c49070" stroke-width="1"/><line x1="0" y1="5" x2="2.5" y2="5" stroke="#c49070" stroke-width="1"/><line x1="7.5" y1="5" x2="10" y2="5" stroke="#c49070" stroke-width="1"/></svg> Le Grand Jour';}
    document.getElementById('lune-icon').innerHTML=season==='nuit'?svgNuit():svgJour();
    document.getElementById('lune-step-name').innerHTML=step.name;
    document.getElementById('lune-step-desc').innerHTML=step.descs[info.descIdx];
    var fill=document.getElementById('lune-fill');
    fill.style.width=info.globalPct+'%';fill.className='lune-fill-'+season;
    document.getElementById('lune-pct').textContent=info.globalPct+' %';
    var glyphMap={aube:'&#9728;',jour_plein:'&#9728;',declin:'&#9728;',nuit_profonde:'&#9790;',nuit_stable:'&#10022;',nuit_finissante:'&#9790;'};
    var ng=document.getElementById('lune-next-glyph');
    ng.innerHTML=glyphMap[info.nextStep.key]||'&#183;';
    ng.style.color=season==='nuit'?'rgba(160,155,210,0.65)':'rgba(190,130,70,0.65)';
    document.getElementById('lune-next-name').innerHTML=info.nextStep.name;
    var d=Math.floor(info.daysRemaining),h=Math.round((info.daysRemaining-d)*24);
    document.getElementById('lune-next-days').textContent=d>0?'dans '+d+'j '+h+'h':'dans '+h+'h';
    var shown=new Date(now);shown.setFullYear(shown.getFullYear()-YEAR_OFFSET);
    var jours=['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'],mois=['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
    document.getElementById('lune-header').innerHTML='&#x2B21; '+jours[shown.getDay()]+' '+shown.getDate()+' '+mois[shown.getMonth()]+' '+shown.getFullYear();
  }
  render();
  setInterval(render, 30*60*1000);
})();

(function selHomeWelcomeAndAdmin() {
  var selDone = false;
  var SEL_UI_WORDS = ['anonymous','associer','ajouter','personnage','compte','connect'];
  function selIsUI(t) {
    var l = t.toLowerCase();
    for (var i = 0; i < SEL_UI_WORDS.length; i++) {
      if (l.indexOf(SEL_UI_WORDS[i]) !== -1) return true;
    }
    return false;
  }
  function selWelcomeRender() {
    if (selDone) return;
    var isLoggedIn = !!document.querySelector('#sel-fa-nav a[href*="logout"]');
    var nameEl = document.getElementById('sel-welcome-name');
    var guestEl = document.getElementById('sel-guest-name');
    if (!isLoggedIn) { selDone = true; return; }

    if (guestEl) guestEl.style.display = 'none';

    var uname = '';
    var sw = document.getElementById('switcheroo');
    if (sw) {
      var walker = document.createTreeWalker(sw, 4, null, false);
      var nd;
      while ((nd = walker.nextNode())) {
        var tv = nd.nodeValue.trim();
        if (tv.length > 2 && !selIsUI(tv)) {
          uname = tv;
          break;
        }
      }
    }
    if (!uname) {
      try {
        var ud = (typeof _userdata !== 'undefined') ? _userdata : null;
        if (ud && ud['username'] && !selIsUI(String(ud['username']))) {
          uname = String(ud['username']);
        }
      } catch(ex) { uname = ''; }
    }
    if (uname && nameEl) { nameEl.textContent = uname; selDone = true; }
  }
  function selHorsRpTransform() {
    var blocks = document.querySelectorAll('.cat-block');
    var hb = null;
    for (var bi = 0; bi < blocks.length; bi++) {
      var tt = blocks[bi].querySelector('.cat-title');
      if (tt && tt.textContent.indexOf('Hors RP') !== -1) { hb = blocks[bi]; break; }
    }
    if (!hb || hb.classList.contains('is-horsrp')) return;
    var rows = hb.querySelectorAll('.forum-row');
    var rowArr = [];
    for (var ri = 0; ri < rows.length; ri++) {
      var nEl = rows[ri].querySelector('.forum-name');
      if (!nEl) continue;
      var nm = nEl.textContent.trim();
      var subAs = rows[ri].querySelectorAll('.subforums a');
      var subs = [];
      for (var si = 0; si < subAs.length; si++) {
        subs.push([subAs[si].textContent.trim(), subAs[si].href]);
      }
      var lmDiv = rows[ri].querySelector('.last-msg');
      var lm = (lmDiv && lmDiv.textContent.trim()) ? lmDiv.outerHTML : null;
      rowArr.push([nm, nEl.href, subs, lm]);
    }
    function findSec(nm) {
      for (var fi = 0; fi < rowArr.length; fi++) {
        if (rowArr[fi][0].indexOf(nm) !== -1) return rowArr[fi];
      }
      return null;
    }
    function btn(txt, href) { return '<a href="' + href + '" class="hrp-btn">' + txt + '</a>'; }
    function mkbtns(sec) {
      if (!sec) return '';
      var bh = '';
      var ls = sec[2];
      for (var ki = 0; ki < ls.length; ki++) { bh += btn(ls[ki][0], ls[ki][1]); }
      return bh;
    }
    function mklm(sec) {
      if (!sec || !sec[3]) return '';
      return sec[3];
    }
    var det = findSec('tente');
    var ent = findSec('Entraide');
    var arc = findSec('Archives');
    var html =
      '<div class="hrp-cols">' +
        '<div class="hrp-sub-block hrp-col-detente">' +
          '<div class="hrp-detente-inner">' +
            '<div class="hrp-top-img"></div>' +
            '<div class="hrp-detente-right">' +
              '<div class="hrp-sub-title"><a href="' + (det ? det[1] : '#') + '">Détente</a></div>' +
              '<div class="hrp-buttons">' + mkbtns(det) + '</div>' +
              mklm(det) +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="hrp-sub-block hrp-col-entraide">' +
          '<div class="hrp-sub-title"><a href="' + (ent ? ent[1] : '#') + '">Entraide et partage</a></div>' +
          '<div class="hrp-buttons">' + mkbtns(ent) + '</div>' +
          mklm(ent) +
          '<div class="hrp-entraide-img"></div>' +
        '</div>' +
        '<div class="hrp-sub-block hrp-col-archives">' +
          '<div class="hrp-sub-title"><a href="' + (arc ? arc[1] : '#') + '">Archives</a></div>' +
          '<div class="hrp-archives-img"></div>' +
          '<div class="hrp-buttons">' + mkbtns(arc) + '</div>' +
        '</div>' +
      '</div>';
    var content = hb.querySelector('.cat-content');
    if (content) { content.innerHTML = html; hb.classList.add('is-horsrp'); }
  }
  function selAdminTransform() {
    var blocks = document.querySelectorAll('.cat-block');
    var ab = null;
    for (var bi = 0; bi < blocks.length; bi++) {
      var tt = blocks[bi].querySelector('.cat-title');
      if (tt && tt.textContent.trim() === 'Administration') { ab = blocks[bi]; break; }
    }
    if (!ab || ab.classList.contains('is-admin')) return;
    var rows = ab.querySelectorAll('.forum-row');
    var rowArr = [];
    for (var ri = 0; ri < rows.length; ri++) {
      var nEl = rows[ri].querySelector('.forum-name');
      if (!nEl) continue;
      var nm = nEl.textContent.trim();
      var subAs = rows[ri].querySelectorAll('.subforums a');
      var subs = [];
      for (var si = 0; si < subAs.length; si++) {
        subs.push([subAs[si].textContent.trim(), subAs[si].href]);
      }
      var lmEl = rows[ri].querySelector('.last-msg');
      var lm = (lmEl && lmEl.textContent.trim()) ? lmEl.outerHTML : null;
      rowArr.push([nm, nEl.href, subs, lm]);
    }
    function findSec(nm) {
      for (var fi = 0; fi < rowArr.length; fi++) {
        if (rowArr[fi][0] === nm) return rowArr[fi];
      }
      return null;
    }
    function btn(txt, href) { return '<a href="' + href + '" class="adm-btn">' + txt + '</a>'; }
    function mkbtns(sec) {
      if (!sec) return '';
      var bh = '';
      var ls = sec[2];
      for (var ki = 0; ki < ls.length; ki++) { bh += btn(ls[ki][0], ls[ki][1]); }
      return bh;
    }
    function mklm(sec) {
      if (!sec || !sec[3]) return '';
      return sec[3];
    }
    var p = findSec('Personnages');
    var v = findSec('Vie sur la Lune');
    var g = findSec('Gestion');
    var GB = 'https://astraluna.forumactif.com/h7-guidebook-v7';
    var html =
      '<div class="adm-guidebook">' +
        '<div class="adm-gb-left">' +
          '<h2 class="adm-gb-title">Guidebook</h2>' +
          '<a class="adm-gb-link" href="' + GB + '#contexte" target="_blank">Contexte</a>' +
          '<a class="adm-gb-link" href="' + GB + '#reglement" target="_blank">Règlement</a>' +
          '<a class="adm-gb-link" href="' + GB + '#groupes" target="_blank">Groupes</a>' +
        '</div>' +
        '<div class="adm-gb-blob"></div>' +
      '</div>' +
      '<div class="adm-lower">' +
        '<div class="adm-left-col">' +
          '<div class="adm-sub-block">' +
            '<div class="adm-sub-title"><a href="' + (p ? p[1] : '#') + '">Personnages</a></div>' +
            '<div class="adm-personnages-inner">' +
              '<div class="adm-personnages-img"></div>' +
              '<div class="adm-personnages-right">' +
                '<div class="adm-sub-links">' + mkbtns(p) + '</div>' +
                mklm(p) +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="adm-sub-block">' +
            '<div class="adm-sub-title"><a href="' + (v ? v[1] : '#') + '">Vie sur la Lune</a></div>' +
            '<div class="adm-btn-grid2">' + mkbtns(v) + '</div>' +
            '<div class="adm-vie-row">' + mklm(v) + '<div class="adm-vie-img"></div></div>' +
          '</div>' +
        '</div>' +
        '<div class="adm-sub-block">' +
          '<div class="adm-sub-title"><a href="' + (g ? g[1] : '#') + '">Gestion</a></div>' +
          '<div class="adm-sub-links">' + mkbtns(g) + '</div>' +
          mklm(g) +
          '<div class="adm-gestion-img"></div>' +
        '</div>' +
      '</div>';
    var content = ab.querySelector('.cat-content');
    if (content) { content.innerHTML = html; ab.classList.add('is-admin'); }
  }
  function selFormatDates() {
    var MOIS = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
    var els = document.querySelectorAll('.sel-lp-date');
    for (var i = 0; i < els.length; i++) {
      var raw = els[i].textContent.trim();
      var lo = raw.toLowerCase();
      var out = '';
      if (lo.indexOf('aujourd') !== -1) {
        var mt = raw.match(/(\d{1,2})[h:H](\d{2})/);
        if (mt) out = mt[1] + 'h' + mt[2];
      } else if (lo.indexOf('hier') !== -1) {
        out = 'hier';
      } else {
        var md = raw.match(/(\d{1,2})\s+([A-Za-zà-ÿ]+)/);
        if (md) {
          var jour = md[1];
          var nomMois = md[2].toLowerCase();
          var numMois = 0;
          for (var j = 0; j < MOIS.length; j++) {
            if (MOIS[j].indexOf(nomMois.substring(0, 3)) !== -1) {
              numMois = j + 1;
              break;
            }
          }
          if (numMois > 0) {
            out = (jour.length < 2 ? '0' + jour : jour) + '/' + (numMois < 10 ? '0' + numMois : numMois);
          }
        }
      }
      if (out) els[i].textContent = out;
    }
  }
  function selCatToggle() {
    document.querySelectorAll('.cat-header:not([data-sel-tog])').forEach(function(header) {
      header.setAttribute('data-sel-tog', '1');
      header.addEventListener('click', function() {
        var content = header.nextElementSibling;
        var toggle = header.querySelector('.cat-toggle');
        if (!content) { return; }
        var collapsed = content.classList.toggle('is-collapsed');
        if (toggle) {
          toggle.classList.toggle('is-collapsed', collapsed);
          toggle.setAttribute('aria-label', collapsed ? 'Déplier' : 'Replier');
        }
      });
    });
  }
  function selProcessLastMsg() {
    document.querySelectorAll('.last-msg:not([data-sel])').forEach(function(lm) {
      lm.setAttribute('data-sel', '1');
      var authorRaw = lm.querySelector('.lm-author-raw');
      if (!authorRaw) { return; }
      var raw = authorRaw.innerHTML;
      var brIdx = raw.toLowerCase().indexOf('<br');
      var dateHtml = brIdx !== -1 ? raw.substring(0, brIdx) : '';
      var authorHtml = brIdx !== -1 ? raw.substring(raw.indexOf('>', brIdx) + 1) : raw;
      var tmp = document.createElement('div');
      tmp.innerHTML = authorHtml;
      var postIcon = tmp.querySelector('a.last-post-icon, a[class*="post-icon"]');
      var postUrl = postIcon ? postIcon.href : '';
      var junk = tmp.querySelectorAll('img, span.icon, span.gen, span[class*="icon"], a.last-post-icon, a[class*="post-icon"]');
      for (var i = 0; i < junk.length; i++) { junk[i].parentNode.removeChild(junk[i]); }
      var links = tmp.querySelectorAll('a');
      var authorInner = '';
      for (var li = 0; li < links.length; li++) { authorInner += links[li].outerHTML; }
      if (!authorInner) { authorInner = tmp.textContent.trim(); }
      authorRaw.innerHTML = authorInner;
      authorRaw.className = 'lm-author';
      var timeEl = lm.querySelector('.lm-time');
      if (timeEl && dateHtml) { timeEl.textContent = dateHtml.replace(/<[^>]+>/g, '').trim(); }
      if (postUrl) {
        var moon = lm.querySelector('.lm-moon');
        if (moon) { moon.href = postUrl; }
      }
      var authorA = lm.querySelector('.lm-author a[href]');
      if (authorA) {
        var right = lm.querySelector('.lm-right');
        (function(profileUrl, rightEl) {
          fetch(profileUrl)
            .then(function(r) { return r.text(); })
            .then(function(html) {
              var parser = new DOMParser();
              var doc = parser.parseFromString(html, 'text/html');
              var img = doc.querySelector('.mod-login-avatar img, img.img, .avatar img, .profile-avatar img');
              if (!img) {
                var allImgs = doc.querySelectorAll('img[src]');
                for (var k = 0; k < allImgs.length; k++) {
                  var s = allImgs[k].getAttribute('src') || '';
                  if (s.indexOf('avatar') !== -1 || s.indexOf('profil') !== -1) { img = allImgs[k]; break; }
                }
              }
              if (img && img.src && rightEl) {
                var clip = document.createElement('div');
                clip.className = 'lm-avatar-clip';
                var newImg = document.createElement('img');
                newImg.src = img.src;
                newImg.alt = '';
                clip.appendChild(newImg);
                rightEl.insertBefore(clip, rightEl.firstChild);
              }
            })
            .catch(function(e) { return e; });
        })(authorA.href, right);
      }
    });
  }
  function selRunAll() {
    selWelcomeRender();
    selFormatDates();
    selAdminTransform();
    selHorsRpTransform();
    selCatToggle();
    selProcessLastMsg();
  }
  selRunAll();
  setTimeout(selRunAll, 800);
  setTimeout(selFormatDates, 2000);
})();

(function selHomeChatboxIframe() {
  if (!document.querySelector('.sel-chatbox-wrap')) { return; }
  function getChatDoc(obj) {
    try {
      return obj.contentDocument || (obj.contentWindow && obj.contentWindow.document);
    } catch (e) {
      return null;
    }
  }

  function doInject(obj) {
    var chatDoc = getChatDoc(obj);
    if (!chatDoc || !chatDoc.head) { return false; }
    if (!chatDoc.getElementById('sel-chatbox-fonts')) {
      var preconnect1 = chatDoc.createElement('link');
      preconnect1.rel = 'preconnect';
      preconnect1.href = 'https://fonts.googleapis.com';
      chatDoc.head.appendChild(preconnect1);

      var preconnect2 = chatDoc.createElement('link');
      preconnect2.rel = 'preconnect';
      preconnect2.href = 'https://fonts.gstatic.com';
      preconnect2.crossOrigin = 'crossorigin';
      chatDoc.head.appendChild(preconnect2);

      var fonts = chatDoc.createElement('link');
      fonts.id = 'sel-chatbox-fonts';
      fonts.rel = 'stylesheet';
      fonts.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,600&family=Inter:wght@400;500&display=swap';
      chatDoc.head.appendChild(fonts);
    }
    if (!chatDoc.getElementById('sel-chatbox-css')) {
      var css = chatDoc.createElement('link');
      css.id = 'sel-chatbox-css';
      css.rel = 'stylesheet';
      css.href = 'https://wonkaa22.github.io/Test_Astra/selenujo.css';
      chatDoc.head.appendChild(css);
    }
    syncTheme(obj, chatDoc);
    layoutFooter(chatDoc);
    fixHeight(obj, chatDoc);
    bindFullscreenToggle(obj, chatDoc);
    return true;
  }

  var CHATBOX_HEIGHT_PX = 480;

  function fixHeight(obj, chatDoc) {
    var h = obj.clientHeight || obj.offsetHeight || CHATBOX_HEIGHT_PX;
    var px = h + 'px';
    if (chatDoc.documentElement) {
      chatDoc.documentElement.style.cssText = 'height:' + px + ' !important; overflow:hidden !important;';
    }
    if (chatDoc.body) {
      chatDoc.body.style.setProperty('height', px, 'important');
      chatDoc.body.style.setProperty('overflow', 'hidden', 'important');
    }
  }

  /* Au lieu de naviguer vers /chatbox (page non personnalisable, hors
     systeme de templates FA), le bouton "ChatBox" agrandit le widget
     deja stylise en plein ecran par-dessus la page. */
  function setFullscreen(obj, chatDoc, on) {
    var wrap = document.querySelector('.sel-chatbox-wrap');
    if (!wrap) { return; }
    wrap.classList.toggle('sel-chatbox-fullscreen', on);
    document.documentElement.classList.toggle('sel-chatbox-locked', on);
    var closeBtn = chatDoc.getElementById('sel-chatbox-close');
    if (closeBtn) { closeBtn.style.display = on ? 'inline-flex' : 'none'; }
    requestAnimationFrame(function() {
      fixHeight(obj, chatDoc);
      layoutFooter(chatDoc);
    });
  }

  function bindFullscreenToggle(obj, chatDoc) {
    var titleLink = chatDoc.querySelector('a.chat-title');
    if (titleLink && !titleLink.getAttribute('data-sel-bound')) {
      titleLink.setAttribute('data-sel-bound', '1');
      titleLink.addEventListener('click', function(e) {
        e.preventDefault();
        setFullscreen(obj, chatDoc, true);
      });
    }
    var optionsList = chatDoc.getElementById('chatbox_main_options');
    if (optionsList && !chatDoc.getElementById('sel-chatbox-close')) {
      var li = chatDoc.createElement('li');
      var closeBtn = chatDoc.createElement('a');
      closeBtn.id = 'sel-chatbox-close';
      closeBtn.href = 'javascript:void(0)';
      closeBtn.title = 'Reduire la ChatBox';
      closeBtn.style.display = 'none';
      closeBtn.textContent = '✕';
      closeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        setFullscreen(obj, chatDoc, false);
      });
      li.appendChild(closeBtn);
      optionsList.insertBefore(li, optionsList.firstChild);
    }
    chatDoc.removeEventListener('keydown', escHandler);
    chatDoc.addEventListener('keydown', escHandler);
    function escHandler(e) {
      if (e.key === 'Escape') { setFullscreen(obj, chatDoc, false); }
    }
  }

  function layoutFooter(chatDoc) {
    var footer = chatDoc.getElementById('chatbox_footer');
    if (!footer) { return; }
    footer.style.setProperty('height', 'auto', 'important');
    footer.style.setProperty('min-height', '0', 'important');
    footer.style.setProperty('max-height', 'none', 'important');
    var formatBox = footer.querySelector('.right-box:not(.style-buttons)');
    var helpButton = footer.querySelector('#help-button');
    if (formatBox) {
      formatBox.classList.add('sel-format-row');
    }
    if (formatBox && helpButton && helpButton.parentNode !== formatBox) {
      formatBox.appendChild(helpButton);
    }
  }

  function syncTheme(obj, chatDoc) {
    chatDoc = chatDoc || getChatDoc(obj);
    if (!chatDoc || !chatDoc.documentElement) { return; }
    chatDoc.documentElement.classList.add('chatbox-doc');
    var isLight = document.documentElement.classList.contains('light');
    chatDoc.documentElement.classList.toggle('light', isLight);
  }

  var boundObj = null;
  function bindObject(obj) {
    if (boundObj === obj) { return; }
    boundObj = obj;
    obj.addEventListener('load', function() { doInject(obj); });
  }

  var attempts = 0;
  var poll = setInterval(function() {
    attempts++;
    var holder = document.getElementById('chatbox_bottom');
    var obj = holder && holder.querySelector('object');
    if (obj) {
      bindObject(obj);
      if (doInject(obj)) {
        clearInterval(poll);
      }
    }
    if (attempts > 100) { clearInterval(poll); }
  }, 300);

  /* Le formulaire (boutons gras/italique/aide) peut etre regenere par le
     JS de FA apres l'envoi d'un message ou un rafraichissement : on
     reapplique regulierement le regroupement plutot qu'une seule fois. */
  setInterval(function() {
    if (!boundObj) { return; }
    var chatDoc = getChatDoc(boundObj);
    if (chatDoc) {
      layoutFooter(chatDoc);
      fixHeight(boundObj, chatDoc);
    }
  }, 1000);

  new MutationObserver(function() {
    if (boundObj) { syncTheme(boundObj); }
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
})();

(function selHomeFooterWidgets() {
  if (!document.querySelector('.sel-footer-wrap')) { return; }
  var SEL_GROUPES = {
    "1": { title: "Groupe 1", text: "Description du groupe — à personnaliser. Quelques lignes présentant ses membres, ses valeurs ou son rôle dans la nation de Selenujo.", link: "#" },
    "2": { title: "Groupe 2", text: "Description du deuxième groupe — à personnaliser selon la faction ou l'organisation représentée dans le forum.", link: "#" },
    "3": { title: "Groupe 3", text: "Description du troisième groupe — présentation de ses attributions, de son histoire et de ses membres au sein de Selenujo.", link: "#" },
    "4": { title: "Groupe 4", text: "Description du quatrième groupe — contexte narratif, rôle politique ou social dans l'écosystème de la lune.", link: "#" },
    "5": { title: "Groupe 5", text: "Description du cinquième groupe — texte libre à adapter selon la structure de groupes définie par l'administration.", link: "#" }
  };

  /* ── Construit la ligne "X lunaires et Y terriens" ── */
  function selBuildCount(txt) {
    var rM = txt.match(/(\d+)\s+enregistr[ée]s?/i);
    var gM = txt.match(/(\d+)\s+invit[ée]s?/i);
    var reg   = rM ? parseInt(rM[1], 10) : 0;
    var guest = gM ? parseInt(gM[1], 10) : 0;
    var parts = [];
    if (reg > 0)   { parts.push(reg   + ' lunaire'  + (reg   > 1 ? 's' : '')); }
    if (guest > 0) { parts.push(guest + ' terrien' + (guest > 1 ? '·ne·s' : '·ne')); }
    if (parts.length === 0) { return 'Aucun lunaire en ligne'; }
    return parts.join(' et ') + ' en ce moment';
  }

  /* ── Statistiques : spans portail OU fallback body.innerHTML ── */
  function selFixStats() {
    var elMembers = document.querySelector('.stat-num[data-stat="members"]');
    var elPosts   = document.querySelector('.stat-num[data-stat="posts"]');

    /* Essaie d'abord les spans injectés par mod_statistics */
    var usersSpan = document.getElementById('selTotalUsers') ||
                    document.querySelector('.mod-stats-users');
    var postsSpan = document.getElementById('selTotalPosts') ||
                    document.querySelector('.mod-stats-posts');
    if (usersSpan && elMembers) {
      var uNum = (usersSpan.textContent || '').match(/\d+/);
      if (uNum) { elMembers.textContent = uNum[0]; }
    }
    if (postsSpan && elPosts) {
      var pNum = (postsSpan.textContent || '').match(/\d+/);
      if (pNum) { elPosts.textContent = pNum[0]; }
    }

    /* Fallback : corrige la phrase FA si elle s'est glissée dans le span */
    if (elPosts) {
      var pTxt = elPosts.textContent || '';
      if (pTxt.length > 6) {
        var pFix = pTxt.match(/\d+/);
        if (pFix) { elPosts.textContent = pFix[0]; }
      }
    }
  }

  function selFetchMemberCount() { /* no-op */ }

  /* ── Zone 1 : spans portail OU fallback body.innerHTML ── */
  function selWhoIsOnline() {
    var zone = document.getElementById('selZone1');
    if (!zone || zone.children.length > 0) { return; }

    var totalText = '';
    var listHtml  = '';

    var totalSpan = document.getElementById('selOnlineTotal');
    var listSpan  = document.getElementById('selOnlineList');

    if (totalSpan) {
      totalText = totalSpan.textContent || '';
      listHtml  = listSpan ? (listSpan.innerHTML || '') : '';
    } else {
      /* Fallback : textContent pour le chiffre (évite les balises HTML autour du nb) */
      var bText = document.body.textContent || '';
      var tM = bText.match(/(\d+)\s+utilisateurs?\s+en ligne/i);
      if (tM) { totalText = tM[1] + ' utilisateurs en ligne'; }
      /* innerHTML pour la liste (on a besoin des liens <a>) */
      var bHtml = document.body.innerHTML;
      var lM = bHtml.match(/Utilisateurs?\s+enregistr[ée]s?\s*:([\s\S]*?)<br/i);
      if (lM) { listHtml = lM[1]; }
    }

    var wrap = document.createElement('div');
    wrap.className = 'sel-online-wrap';
    var countEl = document.createElement('div');
    countEl.className = 'sel-online-count';
    countEl.textContent = selBuildCount(document.body.textContent || '');
    wrap.appendChild(countEl);

    if (listHtml) {
      var membersMatch = listHtml.match ? listHtml : null;
      var sDiv = document.createElement('div');
      sDiv.innerHTML = listHtml;
      var uLinks = sDiv.querySelectorAll('a[href]');
      if (uLinks.length > 0) {
        var membersEl = document.createElement('div');
        membersEl.className = 'sel-online-members';
        for (var k = 0; k < uLinks.length; k++) {
          var clean = document.createElement('a');
          clean.href = uLinks[k].getAttribute('href');
          clean.textContent = uLinks[k].textContent.trim();
          membersEl.appendChild(clean);
          if (k < uLinks.length - 1) {
            membersEl.appendChild(document.createTextNode(', '));
          }
        }
        wrap.appendChild(membersEl);
      }
    }
    zone.appendChild(wrap);
  }

  function selGroupeInit() {
    var btns = document.querySelectorAll('#selGroupeBtns .groupe-btn');
    var titleEl = document.getElementById('selGroupeTitle');
    var textEl  = document.getElementById('selGroupeText');
    var linkEl  = document.getElementById('selGroupeLink');
    if (!btns.length || !titleEl) { return; }
    btns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        btns.forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var key = btn.getAttribute('data-group');
        var g = SEL_GROUPES[key];
        if (!g) { return; }
        titleEl.textContent = g.title;
        textEl.textContent  = g.text;
        linkEl.href         = g.link;
      });
    });
  }

  function selNouveauAvatar() {
    var nameEl = document.getElementById('selNouveauName');
    var imgSlot = document.getElementById('selNouveauImg');
    if (!nameEl || !imgSlot) { return; }
    fetch('/memberlist?mode=joined&order=DESC')
      .then(function(r) { return r.text(); })
      .then(function(html) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, 'text/html');
        var row = doc.querySelector('#memberlist tbody tr');
        if (!row) { return; }
        var link = row.querySelector('td.avatar-mini a[href]');
        if (!link) { return; }
        nameEl.href = link.getAttribute('href');
        nameEl.textContent = (link.textContent || '').trim();
        var img = link.querySelector('img');
        if (img && img.src) {
          var el = document.createElement('img');
          el.src = img.src;
          el.alt = '';
          imgSlot.appendChild(el);
        }
      })
      .catch(function(e) { return e; });
  }

  /* ── Convertit le texte "Dernière visite" FA en objet Date ── */
  function selParseLastVisit(text) {
    text = (text || '').trim();
    var now = new Date();
    var hm = text.match(/(\d{1,2}):(\d{2})/);
    if (/^Aujourd'hui/i.test(text)) {
      var d1 = new Date(now);
      if (hm) { d1.setHours(parseInt(hm[1], 10), parseInt(hm[2], 10), 0, 0); }
      return d1;
    }
    if (/^Hier/i.test(text)) {
      var d2 = new Date(now);
      d2.setDate(d2.getDate() - 1);
      if (hm) { d2.setHours(parseInt(hm[1], 10), parseInt(hm[2], 10), 0, 0); }
      return d2;
    }
    var months = {
      'janvier': 0, 'février': 1, 'fevrier': 1, 'mars': 2, 'avril': 3,
      'mai': 4, 'juin': 5, 'juillet': 6, 'août': 7, 'aout': 7,
      'septembre': 8, 'octobre': 9, 'novembre': 10, 'décembre': 11, 'decembre': 11
    };
    var dm = text.match(/(\d{1,2})\s+([A-Za-zéûôàè]+)\s+(\d{4})\s*-\s*(\d{1,2}):(\d{2})/);
    if (dm) {
      var month = months[dm[2].toLowerCase()];
      if (typeof month === 'number') {
        return new Date(parseInt(dm[3], 10), month, parseInt(dm[1], 10), parseInt(dm[4], 10), parseInt(dm[5], 10));
      }
    }
    return null;
  }

  /* ── Zone 2 : liste des membres connectés dans les dernières 48h ── */
  function selFetchRecent48h() {
    var zone = document.getElementById('selZone2');
    if (!zone) { return; }
    fetch('/memberlist?mode=lastvisit&order=DESC')
      .then(function(r) { return r.text(); })
      .then(function(html) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, 'text/html');
        var rows = doc.querySelectorAll('#memberlist tbody tr');
        var now = new Date();
        var limit = 48 * 60 * 60 * 1000;
        var members = [];
        for (var i = 0; i < rows.length; i++) {
          var tds = rows[i].querySelectorAll('td');
          if (tds.length < 5) { continue; }
          var link = tds[1].querySelector('a[href]');
          var visitDate = selParseLastVisit(tds[4].textContent);
          if (!link || !visitDate) { continue; }
          var diff = now.getTime() - visitDate.getTime();
          if (diff < 0 || diff > limit) { break; }
          members.push({ href: link.getAttribute('href'), name: link.textContent.trim() });
        }
        if (members.length === 0) {
          zone.textContent = 'Aucun lunaire connecté ces dernières 48h.';
          return;
        }
        var wrap = document.createElement('div');
        wrap.className = 'sel-online-members';
        for (var k = 0; k < members.length; k++) {
          var a = document.createElement('a');
          a.href = members[k].href;
          a.textContent = members[k].name;
          wrap.appendChild(a);
          if (k < members.length - 1) {
            wrap.appendChild(document.createTextNode(', '));
          }
        }
        zone.appendChild(wrap);
      })
      .catch(function(e) { return e; });
  }

  function selFooterReorder() {
    var footer = document.querySelector('.sel-footer-wrap');
    if (!footer) { return; }
    var parent = footer.parentNode;
    if (!parent) { return; }
    /* Trouve le premier .panel frère qui SUIT le footer */
    var panels = parent.querySelectorAll('.panel');
    for (var p = 0; p < panels.length; p++) {
      if (panels[p].parentNode === parent &&
          panels[p].compareDocumentPosition(footer) & 4) {
        parent.insertBefore(footer, panels[p]);
        return;
      }
    }
  }

  function selInit() {
    selFooterReorder();
    selFixStats();
    selFetchMemberCount();
    selWhoIsOnline();
    selGroupeInit();
    selNouveauAvatar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', selInit);
  } else {
    selInit();
  }
  /* Retry sur window.load : portail maintenant chargé */
  window.addEventListener('load', function() {
    selFooterReorder();

    /* ── Met à jour le count Zone 1 (portail chargé maintenant) ── */
    var countEl = document.querySelector('.sel-online-count');
    if (countEl) {
      var newCount = selBuildCount(document.body.textContent || '');
      countEl.textContent = newCount;
    }

    /* ── Met à jour le compte membres via fetch /memberlist ── */
    fetch('/memberlist')
      .then(function(r) { return r.text(); })
      .then(function(html) {
        /* Essaie la pagination "sur X" */
        var mPag = html.match(/sur\s+(\d+)/i) || html.match(/(\d+)\s*r[ée]sultat/i);
        var count = mPag ? mPag[1] : null;
        if (!count) {
          /* Compte les liens de profil uniques /uN */
          var links = html.match(/href="\/u\d+"/g) || [];
          var ids = new Object();
          for (var j = 0; j < links.length; j++) {
            ids[links[j].replace(/\D/g, '')] = 1;
          }
          var c = Object.keys(ids).length;
          if (c > 0) { count = String(c); }
        }
        if (count) {
          var elM = document.querySelector('.stat-num[data-stat="members"]');
          if (elM) { elM.textContent = count; }
        }
      })
      .catch(function(e) { return e; });

    /* ── Corrige posts si encore phrase complète ── */
    var elPosts2 = document.querySelector('.stat-num[data-stat="posts"]');
    if (elPosts2 && (elPosts2.textContent || '').length > 6) {
      var pFix2 = elPosts2.textContent.match(/\d+/);
      if (pFix2) { elPosts2.textContent = pFix2[0]; }
    }

    /* ── Zone 2 : membres connectés dans les dernières 48h ── */
    selFetchRecent48h();
  });
})();
