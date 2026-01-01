// Placeholder URL - Replace with your actual Google Apps Script URL
const GOOGLE_SHEET_ENDPOINT = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec";

export interface VotePayload {
  category: string;
  nominee: string;
  voterName: string;
  deviceId: string;
  timestamp: string;
}

export interface VoteResponse {
  success: boolean;
  message?: string;
}

export const submitVote = async (
  category: string,
  nominee: string,
  voterName: string = "مجهول",
  deviceId: string = "unknown"
): Promise<VoteResponse> => {
  const payload: VotePayload = {
    category,
    nominee,
    voterName,
    deviceId,
    timestamp: new Date().toISOString(),
  };

  try {
    const response = await fetch(GOOGLE_SHEET_ENDPOINT, {
      method: "POST",
      mode: "no-cors", // Required for Google Apps Script
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    // With no-cors mode, we can't read the response
    // So we assume success if no error is thrown
    return {
      success: true,
      message: "تم تسجيل صوتك بنجاح!",
    };
  } catch (error) {
    console.error("Vote submission error:", error);
    return {
      success: false,
      message: "حدث خطأ أثناء التصويت. يرجى المحاولة مرة أخرى.",
    };
  }
};

// Helper to check if user has voted in a category (using localStorage)
export const hasVotedInCategory = (categoryId: string): boolean => {
  const votes = JSON.parse(localStorage.getItem("vandeland_votes") || "{}");
  return !!votes[categoryId];
};

// Helper to save vote locally
export const saveVoteLocally = (categoryId: string, nomineeId: string): void => {
  const votes = JSON.parse(localStorage.getItem("vandeland_votes") || "{}");
  votes[categoryId] = nomineeId;
  localStorage.setItem("vandeland_votes", JSON.stringify(votes));
};

// Helper to get all local votes
export const getLocalVotes = (): Record<string, string> => {
  return JSON.parse(localStorage.getItem("vandeland_votes") || "{}");
};

// Helper to get voter name
export const getVoterName = (): string | null => {
  return localStorage.getItem("vandeland_voter_name");
};

// Helper to check if user has registered
export const isUserRegistered = (): boolean => {
  return !!localStorage.getItem("vandeland_voter_name");
};
