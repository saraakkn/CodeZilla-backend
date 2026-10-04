const express = require('express');
const cors = require('cors');
const { LeetCode } = require('leetcode-query');

const app = express();
app.use(cors());
app.use(express.json());

const leetcode = new LeetCode();

const trackedUsers = [
  {
    userId: "1",
    fullName: "Sara Khan",
    username: "saraa_khan",
    year: "Second Year"
  },
  {
    userId: "2",
    fullName: "Soham Jagtap",
    username: "ThatGuySoham",
    year: "Third Year"
  },
  {
    userId: "3",
    fullName: "Yokabid Zehra",
    username: "YokabidZehra110",
    year: "Second Year"
  },
  {
    userId: "4",
    fullName: "Dhakshan Kumar",
    username: "Dhakshankumar",
    year: "Third Year"
  },
  {
    userId: "5",
    fullName: "Sreevyas P",
    username: "Sreevyas_P",
    year: "First Year"
  },
  {
    userId: "6",
    fullName: "Prateeksha",
    username: "PrateekshaM",
    year: "First Year"
  },
  {
    userId: "7",
    fullName: "Shubh Veer",
    username: "Shubh_Veer",
    year: "First Year"
  },
  {
    userId: "8",
    fullName: "Srinivasan",
    username: "Srinivasan_07",
    year: "Second Year"
  },
  {
    userId: "9",
    fullName: "Sharon",
    username: "sharon_rd",
    year: "Second Year"
  },
  {
    userId: "10",
    fullName: "Shobhitha",
    username: "GShobhitha",
    year: "Second Year"
  },
  {
    userId: "11",
    fullName: "Jithendra",
    username: "Jithendra21",
    year: "Third Year"
  },
  {
    userId: "12",
    fullName: "Swetha S",
    username: "sswetha_27",
    year: "Third Year"
  },
  {
    userId: "13",
    fullName: "Divyam Sinha",
    username: "r1ThJk5Jzu",
    year: "Third Year"
  },
  {
    userId: "14",
    fullName: "Showbini",
    username: "showbinis",
    year: "Second Year"
  },
  {
    userId: "15",
    fullName: "S R Jagan Narayana",
    username: "jagannarayanasr",
    year: "First Year"
  },
  {
    userId: "16",
    fullName: "Sandhya",
    username: "SandhyaSukumar",
    year: "First Year"
  },
  {
    userId: "17",
    fullName: "Chinmayi B",
    username: "Chinmayi_B",
    year: "First Year"
  },
  {
    userId: "18",
    fullName: "Amit Tejas",
    username: "AmitTejas",
    year: "Third Year"
  },
  {
    userId: "19",
    fullName: "Nishanth Uttam Paul",
    username: "Nishanth_uttam",
    year: "First Year"
  }
];

// In-memory cache variables
let leaderboardCache = null;
let lastFetchTime = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

app.get('/api/leaderboard', async (req, res) => {
  if (leaderboardCache && (Date.now() - lastFetchTime < CACHE_DURATION)) {
    return res.json(leaderboardCache);
  }

  try {
    const leaderboardData = [];

    for (const student of trackedUsers) {
      try {
        const profile = await leetcode.user(student.username);
        
        if (!profile || !profile.matchedUser) {
          console.log(`User ${student.username} not found on LeetCode`);
          continue;
        }

        const stats = profile.matchedUser.submitStats.acSubmissionNum;
        const solvedEasy = stats.find(s => s.difficulty === "Easy")?.count || stats[1]?.count || 0;
        const solvedMedium = stats.find(s => s.difficulty === "Medium")?.count || stats[2]?.count || 0;
        const solvedHard = stats.find(s => s.difficulty === "Hard")?.count || stats[3]?.count || 0;

        const xp = (solvedEasy * 2) + (solvedMedium * 3) + (solvedHard * 5);
        const realBadges = profile.matchedUser.badges 
          ? profile.matchedUser.badges.map(b => b.displayName) 
          : [];

        leaderboardData.push({
          userId: student.userId,
          fullName: student.fullName,
          username: student.username,
          year: student.year,
          levelNumber: 1, 
          streak: 5,    
          featuredBadges: realBadges,
          xp: xp,
          avatar: profile.matchedUser.profile?.userAvatar || ""
        });

        // Small pause between requests to prevent Nginx 404 blocks
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (userErr) {
        console.error(`Failed to fetch stats for ${student.username}:`, userErr.message);
      }
    }

    leaderboardData.sort((a, b) => b.xp - a.xp);
    
    leaderboardCache = leaderboardData;
    lastFetchTime = Date.now();

    res.json(leaderboardData);
  } catch (error) {
    console.error("Error fetching leaderboard data:", error.message);
    res.status(500).json({ error: "Failed to fetch leaderboard data" });
  }
});

// Robust profile route handling both userId and username
app.get('/api/user/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    
    const student = trackedUsers.find(s => 
      s.userId === identifier || s.username.toLowerCase() === identifier.toLowerCase()
    );
    
    if (!student) {
      return res.status(404).json({ error: "User not found in tracked list" });
    }

    const profile = await leetcode.user(student.username);
    
    if (!profile || !profile.matchedUser) {
      return res.status(404).json({ error: "User not found on LeetCode" });
    }

    const stats = profile.matchedUser.submitStats.acSubmissionNum;
    const solvedEasy = stats.find(s => s.difficulty === "Easy")?.count || stats[1]?.count || 0;
    const solvedMedium = stats.find(s => s.difficulty === "Medium")?.count || stats[2]?.count || 0;
    const solvedHard = stats.find(s => s.difficulty === "Hard")?.count || stats[3]?.count || 0;
    
    const xp = (solvedEasy * 2) + (solvedMedium * 3) + (solvedHard * 5);
    const realBadges = profile.matchedUser.badges 
      ? profile.matchedUser.badges.map(b => b.displayName) 
      : [];

    const userData = {
      userId: student.userId,
      fullName: student.fullName,
      username: student.username,
      year: student.year,
      solvedEasy,
      solvedMedium,
      solvedHard,
      xp,
      featuredBadges: realBadges,
      avatar: profile.matchedUser.profile?.userAvatar || "",
      submissionCalendar: profile.matchedUser.submissionCalendar || null
    };

    res.json(userData);
  } catch (error) {
    console.error(`Error fetching data for ${req.params.identifier}:`, error.message);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});