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

  /* Breadcrumb ☽ — essaie plusieurs sélecteurs FA */
  var pathEl = document.querySelector('.sub-header-path') ||
               document.querySelector('.sub-header nav') ||
               document.querySelector('.navigation') ||
               document.querySelector('nav[class*="breadcrumb"]');
  if (pathEl) {
    Array.prototype.forEach.call(pathEl.childNodes, function (node) {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent = node.textContent.replace(/::/g, '☽');
      }
    });
  }
  /* Fallback : cherche n'importe quel élément contenant '::' dans .sub-header */
  if (!pathEl) {
    var subHeader = document.querySelector('.sub-header, .sub-header-inner');
    if (subHeader) {
      (function replaceInNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
          node.textContent = node.textContent.replace(/::/g, '☽');
        } else {
          Array.prototype.forEach.call(node.childNodes, replaceInNode);
        }
      })(subHeader);
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

    if (avatarEl && !avatarEl.querySelector('img') && username) {
      var avatarSrc = '';

      /* 1. Chercher dans les posts de "Revue du sujet" */
      var reviewPosts = document.querySelectorAll('.topic-review .post, #topic_review .post');
      for (var rpi = 0; rpi < reviewPosts.length; rpi++) {
        var nameEl = reviewPosts[rpi].querySelector('.postprofile-name strong');
        if (nameEl && nameEl.textContent.trim() === username) {
          var ai = reviewPosts[rpi].querySelector('.postprofile-avatar img');
          if (ai) { avatarSrc = ai.src; break; }
        }
      }

      /* 2. Fallback : champs _userdata */
      if (!avatarSrc && typeof _userdata !== 'undefined') {
        avatarSrc = _userdata['user_avatar'] || _userdata['avatar_full'] || _userdata['avatar'] || '';
      }

      if (avatarSrc) {
        var img = document.createElement('img');
        img.src = avatarSrc;
        img.alt = '';
        avatarEl.appendChild(img);
      }
    }
  };
  populatePreview();
  setTimeout(populatePreview, 600);

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
