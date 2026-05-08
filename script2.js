const trendsDb = {
    "fashion": [
        { name: "Digital Twin Couture", tags: ["Meta", "Gen Z"], relevance: 98, risk: "Low", stage: "Rising", platform: "Instagram", insight: "Strong aesthetic appeal aligns with visual-first premium branding." },
        { name: "Sustainable Cyber-Punk", tags: ["Eco", "Edgy"], relevance: 85, risk: "Medium", stage: "Peak", platform: "TikTok", insight: "High engagement but requires authentic eco-messaging to avoid backlash." },
        { name: "Kinetic Smart Fabrics", tags: ["Tech", "Premium"], relevance: 72, risk: "High", stage: "Rising", platform: "X", insight: "Costly production and high skepticism among older demographics." }
    ],
    "tech": [
        { name: "Personal AI Agents", tags: ["Utility", "Viral"], relevance: 95, risk: "Low", stage: "Rising", platform: "X", insight: "Directly solves user friction points; highly shareable utility content." },
        { name: "Mixed Reality Workspaces", tags: ["B2B", "Remote"], relevance: 88, risk: "Medium", stage: "Peak", platform: "Instagram", insight: "Visual 'wow' factor is high, but actual adoption is still niche." }
    ],
    "food": [
        { name: "Molecular Gastronomy Kits", tags: ["DIY", "Home"], relevance: 90, risk: "Low", stage: "Rising", platform: "TikTok", insight: "Perfect for 'ASMR' style short-form video content." }
    ]
};

function showView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    window.scrollTo({top: 0, behavior: 'smooth'});
}

function runAnalysis() {
    const industry = document.getElementById('brandIndustry').value;
    const tone = document.getElementById('brandTone').value;
    const grid = document.getElementById('analysisGrid');
    const mismatch = document.getElementById('mismatchGrid');
    
    grid.innerHTML = '';
    mismatch.innerHTML = '';
    
    (trendsDb[industry] || []).forEach(trend => {
        grid.innerHTML += createTrendCard(trend, tone, true);
    });

    const otherInd = industry === 'fashion' ? 'tech' : 'fashion';
    (trendsDb[otherInd] || []).slice(0, 1).forEach(trend => {
        trend.mismatchReason = tone.includes("Premium") ? "Tone Conflict (Too Edgy)" : "Audience Mismatch";
        mismatch.innerHTML += createTrendCard(trend, tone, false);
    });

    showView('resultsView');
}

function createTrendCard(trend, tone, isMatch) {
    const score = isMatch ? trend.relevance : 30;
    const safeTrendName = String(trend.name).replace(/'/g, "\\'");
    return `
        <div class="trend-card">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                    <span class="badge badge-intel">AI Insight</span>
                    <h3 style="margin-top:8px">${trend.name}</h3>
                </div>
                <div style="text-align:right">
                    <span class="badge badge-stage">${trend.stage}</span>
                    <div style="font-size:0.7rem; font-weight:bold; margin-top:5px;">Fit Score: ${score}%</div>
                </div>
            </div>
            <div style="margin: 10px 0;">
                ${trend.tags.map(t => `<span class="badge" style="background:#f3f0ec; color:#8E7C68">${t}</span>`).join('')}
                <span class="badge" style="background:#eef2ff; color:#4338ca">📍 ${trend.platform}</span>
            </div>
            <div class="score-bar"><div class="score-fill" style="width: ${score}%"></div></div>
            <p class="intel-text">
                ${isMatch ? `<b>Logic:</b> ${trend.insight}` : `<b>Warning:</b> ${trend.mismatchReason}. Current engagement patterns suggest low conversion for ${tone} brands.`}
            </p>
            ${isMatch ? `
            <div class="btn-group" style="justify-content:flex-start; margin-top:15px; gap:10px;">
                <button class="btn-main" style="padding: 0.5rem 1.2rem; font-size:0.8rem;" onclick="openGenerator('${safeTrendName}')">Create Campaign</button>
                ${trend.risk === 'High' ? `<span class="badge badge-risk">⚠️ High Volatility</span>` : ''}
            </div>` : ''}
        </div>
    `;
}

function openGenerator(trendName) {
    document.getElementById('targetTrend').value = trendName;
    showView('campaignView');
}

async function generateCampaign() {
    const trend = document.getElementById('targetTrend').value;
    const platform = document.getElementById('platform').value;
    const type = document.getElementById('contentType').value;
    const brand = document.getElementById('brandName').value || "My Brand";
    
    const output = document.getElementById('campaignOutput');
    const studioContent = document.getElementById('studioContent');
    const loader = document.getElementById('loader');
    const genBtn = document.getElementById('genBtn');

    if(!trend) return alert("Select a trend first!");

    loader.style.display = 'block';
    output.style.display = 'none';
    genBtn.disabled = true;

    const prompt = `Act as a 2026 Creative Director. Create a ${platform} ${type} for trend "${trend}" and brand "${brand}". 
    Return strictly in this format:
    HOOK: [Viral first line]
    CAPTION: [Main body text]
    VISUAL: [Visual concept description]
    HASHTAGS: [#tag1 #tag2 #tag3]
    CTA: [Call to action line]`;

    try {
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.API_KEY}`
            },
            body: JSON.stringify({
                model: CONFIG.MODEL,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 1024
            })
        });

        const data = await response.json();
        const text = data?.choices?.[0]?.message?.content || '';
        
        const hook = text.match(/HOOK:\s*(.*)/i)?.[1] || "";
        const caption = text.match(/CAPTION:\s*(.*)/i)?.[1] || "";
        const visual = text.match(/VISUAL:\s*(.*)/i)?.[1] || "";
        const tags = text.match(/HASHTAGS:\s*(.*)/i)?.[1] || "";
        const cta = text.match(/CTA:\s*(.*)/i)?.[1] || "";

        studioContent.innerHTML = `
            <section><h4>The Hook</h4><p>${hook}</p></section>
            <section><h4>The Narrative</h4><p>${caption}</p></section>
            <section><h4>Visual Concept</h4><p><i>${visual}</i></p></section>
            <section><h4>Hashtags</h4><p style="color:#1d9bf0">${tags}</p></section>
        `;

        document.getElementById('prevBrand').innerText = brand;
        document.getElementById('prevHook').innerText = hook;
        document.getElementById('prevCaption').innerText = caption;
        document.getElementById('prevVisual').innerText = `🎬 ${visual}`;
        document.getElementById('prevTags').innerText = tags;
        document.getElementById('prevCTA').innerText = cta ? `👉 ${cta}` : '';

        output.style.display = 'block';
    } catch (e) {
        studioContent.innerHTML = `<p style="color:#a94442;">Error: ${e.message}</p>`;
        output.style.display = 'block';
    } finally {
        loader.style.display = 'none';
        genBtn.disabled = false;
    }
}
