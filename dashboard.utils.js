// dashboard-utils.js

// Track expanded sections globally
const expandedSections = {};

// Toggle section open/close
function toggleSection(key) {
    expandedSections[key] = !expandedSections[key];
    renderSections();
}

// Generic section renderer
function renderSection(title, field, placeholder, key, iconPath) {
    const isExpanded = expandedSections[key];
    return `
        <div class="bg-white rounded-lg shadow-md mb-4 border border-gray-200">
            <button onclick="toggleSection('${key}')" 
                    class="w-full p-4 flex items-center justify-between hover:bg-blue-50 transition-colors">
                <div class="flex items-center gap-3">
                    <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${iconPath}"/>
                    </svg>
                    <h3 class="text-lg font-semibold">${title}</h3>
                </div>
                <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="${isExpanded ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}"/>
                </svg>
            </button>
            ${isExpanded ? `
                <div class="p-6 border-t bg-gray-50">
                    <textarea onchange="updateField('${field}', this.value)" 
                              placeholder="${placeholder}" 
                              class="w-full p-4 border rounded-lg h-40 focus:ring-2 focus:ring-blue-500">
                        ${appData[field] || ''}
                    </textarea>
                </div>
            ` : ''}
        </div>
    `;
}

// Progress bar renderer
function renderProgressBar(completed, total) {
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
    let feedback = '🚀 Let’s get started!';
    if (progress >= 25 && progress < 50) feedback = '🌱 Making progress!';
    else if (progress >= 50 && progress < 100) feedback = '🔥 Almost done!';
    else if (progress === 100) feedback = '🎉 All milestones completed!';

    return `
        <div class="relative w-full h-2 bg-gray-200 rounded-full">
            <div class="absolute left-0 top-0 h-2 bg-blue-600 rounded-full" style="width: ${progress}%"></div>
        </div>
        <p class="text-sm text-gray-600 mt-2">${feedback}</p>
    `;
}