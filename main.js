document.addEventListener('DOMContentLoaded', () => {
  const navBar = document.getElementById('navBar');
  const overlay = document.querySelector('div.overlay');
  const sideNav = document.getElementById("sideNav");
  const container = document.querySelector('.introduCtry');
  const trendingContainer = document.querySelector('.trendingSong');
  const searchInput = document.querySelector('.search-bar input');
  const apiKey = '7a7fce0e0a63a5e4efb45d52145f2baf';
  
  // --- NAV ---
  function openNav() {
    sideNav.style.width = "65%";
    overlay.style.display = 'block';
  }
  
  function closeNav() {
    sideNav.style.width = "0";
    overlay.style.display = 'none';
  }
  
  navBar.addEventListener('click', () => {
    if (sideNav.style.width === "65%") {
      closeNav();
    } else {
      openNav();
    }
    navBar.classList.toggle('active');
  });
  
  // --- ICON ANIMATION ---
  for (let i = 0; i < 6; i++) {
    const icon = document.createElement('i');
    icon.className = 'uil uil-music-note';
    icon.style.position = 'absolute';
    icon.style.color = 'white';
    icon.style.zIndex = '65';
    icon.style.fontSize = 'x-large';
    icon.style.opacity = '0.3';
    icon.style.top = `${Math.random() * 90}%`;
    icon.style.left = `${Math.random() * 100}%`;
    container.appendChild(icon);
    const animationType = Math.floor(Math.random() * 3) + 1;
    animateIcon(icon, animationType);
  }
  
  function animateIcon(icon, animationType) {
    let duration = Math.random() * 40000 + 90000;
    let start = null;
    let startX = parseFloat(icon.style.left);
    let startY = parseFloat(icon.style.top);
    let endX, endY;
    let rotation = 0;
    
    if (animationType === 1) {
      endX = startX - 60;
      endY = startY - 60;
    } else if (animationType === 2) {
      endX = startX - 50;
      endY = startY - 50;
    } else {
      endX = startX - 50;
      endY = startY - 70;
    }
    
    function step(timestamp) {
      if (!start) start = timestamp;
      let progress = (timestamp - start) / duration;
      if (progress > 1) progress = 1;
      
      icon.style.top = `${startY + (endY - startY) * progress}%`;
      icon.style.left = `${startX + (endX - startX) * progress}%`;
      
      rotation = animationType === 1 ?
        360 - (360 * progress) :
        animationType === 2 ?
        360 * progress :
        360 - (180 * progress);
      
      icon.style.transform = `rotate(${rotation}deg)`;
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        startX = endX + Math.random() * 100;
        startY = endY + Math.random() * 90;
        if (startX > 100) startX = 0;
        if (startY > 90) startY = 0;
        endX = startX - (Math.floor(Math.random() * 3) + 1) * 20;
        endY = startY - (Math.floor(Math.random() * 3) + 1) * 20;
        rotation = 0;
        start = null;
        window.requestAnimationFrame(step);
      }
    }
    
    window.requestAnimationFrame(step);
  }
  
  // --- FETCH FUNCTIONS ---
  async function fetchTopTracks(limit = 10) {
    const url = `https://ws.audioscrobbler.com/2.0/?method=chart.gettoptracks&api_key=${apiKey}&format=json&limit=${limit}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.tracks?.track) displayTrackList(data.tracks.track);
    } catch (err) {
      console.error('Network error:', err);
    }
  }
  
  async function fetchTrackDetail(artist, track) {
    const url = `https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${apiKey}&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(track)}&format=json`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      return data.track || null;
    } catch (e) {
      console.error('Track detail error:', e);
      return null;
    }
  }
  
  // --- DISPLAY TRACKS WITHOUT TYPING EFFECT ---
  async function displayTrackList(trackArray) {
    trendingContainer.innerHTML = '';
    for (const track of trackArray) {
      const placeholder = document.createElement('div');
      placeholder.className = 'tSong flex-direction-row';
      placeholder.style.opacity = '0.3';
      placeholder.style.transform = 'translateY(10px)';
      placeholder.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      placeholder.innerHTML = `
      <br>
        <div class="loader" style="width: 100%; padding: 1rem; text-align:center;">
          <span class="loading-dots">Loading</span>
        </div>
      `;
      trendingContainer.appendChild(placeholder);
      
      const detail = await fetchTrackDetail(track.artist.name, track.name);
      const imageUrl = detail?.album?.image?.[2]?.['#text'];
      if (!detail || !imageUrl) {
        trendingContainer.removeChild(placeholder);
        continue;
      }
      
      const songDiv = document.createElement('div');
      songDiv.className = 'tSong flex-direction-row';
      songDiv.style.opacity = '0';
      songDiv.style.transform = 'translateY(20px)';
      songDiv.style.transition = 'opacity 0.6s ease, transform 1.6s ease';
      
      songDiv.innerHTML = `
        <img src="${imageUrl}" alt="Album Art" style="width:100px;height:100px;border-radius:8px;">
        <div class="write-up" style="margin-left: 1rem;">
          <h3 style="min-height: 1.2em;">${detail.name} - ${detail.artist.name}</h3>
          <p><strong>Listeners:</strong> ${detail.listeners}</p>
          <p><strong>Playcount:</strong> ${detail.playcount}</p>
        </div>
      `;
      
      const img = songDiv.querySelector('img');
      img.addEventListener('load', () => {
        trendingContainer.replaceChild(songDiv, placeholder);
        requestAnimationFrame(() => {
          songDiv.style.opacity = '1';
          songDiv.style.transform = 'translateY(0)';
        });
      });
    }
  }
  
  // --- SEARCH TRACKS ON ENTER ---
  searchInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') {
      searchTracks(searchInput.value.trim());
    }
  });
  
  async function searchTracks(query) {
    const url = `https://ws.audioscrobbler.com/2.0/?method=track.search&track=${encodeURIComponent(query)}&api_key=${apiKey}&format=json&limit=10`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      const tracks = data.results?.trackmatches?.track || [];
      displayTrackList(tracks);
    } catch (err) {
      console.error('Search error:', err);
    }
  }
  
  // 🔄 Load top tracks on page load
  fetchTopTracks(50);
});