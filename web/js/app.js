// Supabase 配置
const SUPABASE_URL = 'https://fjdjumlzqazvulvanmdg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqZGp1bWx6cWF6dnVsdmFubWRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyODkxNjMsImV4cCI6MjA4ODg2NTE2M30.TWY_ftq6GYHU95zFb2JoIJZ0O_JCCwPt9AE_69DgCmI';

// 加载演出数据
async function loadEvents(city = '') {
  const loading = document.getElementById('loading');
  const eventList = document.getElementById('eventList');
  const error = document.getElementById('error');
  
  loading.classList.remove('hidden');
  eventList.classList.add('hidden');
  error.classList.add('hidden');
  
  try {
    let url = `${SUPABASE_URL}/rest/v1/events?select=*&status=eq.active&event_date=gte.${new Date().toISOString()}&order=event_date.asc&limit=8`;
    if (city) {
      url += `&city=eq.${encodeURIComponent(city)}`;
    }
    
    const response = await fetch(url, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    
    if (!response.ok) throw new Error('API Error');
    
    const events = await response.json();
    
    loading.classList.add('hidden');
    
    if (events.length === 0) {
      eventList.innerHTML = '<div class="col-span-4 text-center py-10 text-dark-400">暂无演出信息</div>';
    } else {
      eventList.innerHTML = events.map(event => createEventCard(event)).join('');
    }
    
    eventList.classList.remove('hidden');
    
  } catch (err) {
    console.error('Error loading events:', err);
    loading.classList.add('hidden');
    error.classList.remove('hidden');
  }
}

// 创建演出卡片 HTML
function createEventCard(event) {
  const typeLabels = { concert: '演唱会', livehouse: 'Livehouse', festival: '音乐节' };
  const typeColors = { concert: 'bg-pink-500/80', livehouse: 'bg-purple-500/80', festival: 'bg-orange-500/80' };
  
  const date = new Date(event.event_date);
  const dateStr = date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' });
  
  const artists = event.artist_names ? event.artist_names.join(' / ') : '待公布';
  
  return `
    <a href="/events/detail.html?id=${event.id}" class="bg-dark-900 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-primary-500/10 transition-all group cursor-pointer">
      <div class="aspect-[3/4] relative overflow-hidden">
        ${event.poster_url 
          ? `<img src="${event.poster_url}" alt="${event.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">`
          : `<div class="w-full h-full bg-gradient-to-br from-dark-700 to-dark-800 flex items-center justify-center"><svg class="w-16 h-16 text-dark-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg></div>`
        }
        <div class="absolute top-2 left-2">
          <span class="px-2 py-1 rounded text-xs font-medium ${typeColors[event.event_type] || 'bg-dark-700'} text-white">${typeLabels[event.event_type] || '演出'}</span>
        </div>
      </div>
      <div class="p-4">
        <h3 class="font-medium text-white group-hover:text-primary-400 transition-colors line-clamp-1">${event.title}</h3>
        <p class="text-dark-400 text-sm mt-1 line-clamp-1">${artists}</p>
        <div class="flex items-center gap-2 mt-2 text-xs text-dark-500">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          <span>${dateStr}</span>
        </div>
        <div class="flex items-center gap-2 mt-1 text-xs text-dark-500">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          <span class="line-clamp-1">${event.venue_name || '待定'}</span>
        </div>
        <div class="mt-3">
          <span class="text-primary-400 font-medium">${event.price_range || '待定'}</span>
        </div>
      </div>
    </a>
  `;
}
