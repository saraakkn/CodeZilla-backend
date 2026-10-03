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
    username: "YokabidZehra10",
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

app.get('/api/leaderboard', async (req, res) => {
  try {
    const leaderboardData = [];

    for (const student of trackedUsers) {
      const profile = await leetcode.user(student.username);
      
      if (!profile || !profile.matchedUser) {
        console.log(`User ${student.username} not found on LeetCode`);
        continue;
      }

      const solvedEasy = profile.matchedUser.submitStats.acSubmissionNum[1].count;
      const solvedMedium = profile.matchedUser.submitStats.acSubmissionNum[2].count;
      const solvedHard = profile.matchedUser.submitStats.acSubmissionNum[3].count;

      const xp = (solvedEasy * 2) + (solvedMedium * 3) + (solvedHard * 5);

      // Extract real badges if available on the profile object
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
        featuredBadges: realBadges, // Real badges from LeetCode
        xp: xp,
        avatar: profile.matchedUser.profile.userAvatar
      });
    }

    leaderboardData.sort((a, b) => b.xp - a.xp);
    res.json(leaderboardData);
  } catch (error) {
    console.error("Error fetching LeetCode data:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard data" });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});