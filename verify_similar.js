const http = require('http');

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data); // Return raw if not JSON
        }
      });
    }).on('error', reject);
  });
}

async function testSimilarProblems() {
  try {
    console.log('Fetching problems list...');
    // Try to fetch problems. If 403, we might need to login or use a public endpoint if available.
    // Based on previous 403, it might be protected.
    // However, usually GET /problems is public for a problem list.
    // Let's try to hit the endpoint.
    
    // Note: If the previous 403 was due to read_url_content tool limitations or headers, this script might work if the server allows it.
    // If the route is truly protected, we need a token.
    
    // Try port 4000 (default in index.js)
    const PORT = 4000;
    const listRes = await get(`http://localhost:${PORT}/api/problems?limit=1`);
    
    if (listRes.error || listRes.message === 'Forbidden' || listRes.message === 'Unauthorized') {
        console.log('Access denied to list problems:', listRes);
        return;
    }

    if (!listRes.problems || listRes.problems.length === 0) {
      console.log('No problems found to test.');
      return;
    }

    const problemId = listRes.problems[0]._id;
    console.log(`Testing Problem ID: ${problemId}`);

    // 2. Get the specific problem details
    const problem = await get(`http://localhost:${PORT}/api/problems/${problemId}`);
    
    if (problem.error) {
        console.log('Error fetching details:', problem);
        return;
    }

    console.log(`Title: ${problem.title}`);
    console.log(`Tags: ${problem.tags}`);
    console.log(`Topics: ${problem.topics}`);
    console.log(`Subject: ${problem.subject}`);
    console.log('--- Similar Problems ---');
    
    if (!problem.similarProblems || problem.similarProblems.length === 0) {
        console.log("No similar problems found (Correct behavior if no matches).");
    } else {
        problem.similarProblems.forEach(p => {
            console.log(`- [${p.difficulty}] ${p.title} (ID: ${p._id})`);
        });
    }

  } catch (err) {
    console.error('Script Error:', err.message);
  }
}

testSimilarProblems();
