import { supabase } from "@/integrations/supabase/client";

export interface Voter {
  id: string;
  name: string;
  device_id: string;
  current_category_index: number;
  completed_at: string | null;
  created_at: string;
}

export interface Vote {
  id: string;
  voter_id: string;
  category_id: string;
  nominee_id: string;
  created_at: string;
}

// Generate a unique device ID
export const getDeviceId = (): string => {
  let deviceId = localStorage.getItem("vandeland_device_id");
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem("vandeland_device_id", deviceId);
  }
  return deviceId;
};

// Register a new voter
export const registerVoter = async (name: string): Promise<Voter | null> => {
  const deviceId = getDeviceId();
  
  // Check if voter already exists
  const { data: existingVoter } = await supabase
    .from("voters")
    .select("*")
    .eq("device_id", deviceId)
    .maybeSingle();

  if (existingVoter) {
    localStorage.setItem("vandeland_voter_id", existingVoter.id);
    localStorage.setItem("vandeland_voter_name", existingVoter.name);
    return existingVoter as Voter;
  }

  // Create new voter
  const { data, error } = await supabase
    .from("voters")
    .insert({ name, device_id: deviceId })
    .select()
    .single();

  if (error) {
    console.error("Error registering voter:", error);
    return null;
  }

  localStorage.setItem("vandeland_voter_id", data.id);
  localStorage.setItem("vandeland_voter_name", data.name);
  return data as Voter;
};

// Get current voter
export const getCurrentVoter = async (): Promise<Voter | null> => {
  const deviceId = getDeviceId();
  
  const { data, error } = await supabase
    .from("voters")
    .select("*")
    .eq("device_id", deviceId)
    .maybeSingle();

  if (error || !data) return null;
  return data as Voter;
};

// Submit a vote
export const submitVote = async (
  voterId: string,
  categoryId: string,
  nomineeId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const { error } = await supabase.from("votes").insert({
      voter_id: voterId,
      category_id: categoryId,
      nominee_id: nomineeId,
    });

    if (error) {
      if (error.code === "23505") {
        return { success: false, message: "لقد صوّت بالفعل في هذه الفئة" };
      }
      throw error;
    }

    return { success: true, message: "تم تسجيل صوتك بنجاح!" };
  } catch (error) {
    console.error("Vote submission error:", error);
    return { success: false, message: "حدث خطأ أثناء التصويت. يرجى المحاولة مرة أخرى." };
  }
};

// Update voter's current category index
export const updateVoterProgress = async (
  voterId: string,
  newIndex: number,
  completed: boolean = false
): Promise<boolean> => {
  const updateData: { current_category_index: number; completed_at?: string } = {
    current_category_index: newIndex,
  };
  
  if (completed) {
    updateData.completed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("voters")
    .update(updateData)
    .eq("id", voterId);

  return !error;
};

// Get all votes for analytics
export const getAllVotes = async (): Promise<Vote[]> => {
  const { data, error } = await supabase
    .from("votes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching votes:", error);
    return [];
  }

  return data as Vote[];
};

// Get all voters
export const getAllVoters = async (): Promise<Voter[]> => {
  const { data, error } = await supabase
    .from("voters")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching voters:", error);
    return [];
  }

  return data as Voter[];
};

// Get vote counts by category and nominee
export const getVoteCounts = async (): Promise<Record<string, Record<string, number>>> => {
  const { data, error } = await supabase.from("votes").select("category_id, nominee_id");

  if (error) {
    console.error("Error fetching vote counts:", error);
    return {};
  }

  const counts: Record<string, Record<string, number>> = {};
  
  (data || []).forEach((vote: { category_id: string; nominee_id: string }) => {
    if (!counts[vote.category_id]) {
      counts[vote.category_id] = {};
    }
    counts[vote.category_id][vote.nominee_id] = (counts[vote.category_id][vote.nominee_id] || 0) + 1;
  });

  return counts;
};

// Helper to get voter name from localStorage
export const getVoterName = (): string | null => {
  return localStorage.getItem("vandeland_voter_name");
};

// Helper to check if user has registered
export const isUserRegistered = (): boolean => {
  return !!localStorage.getItem("vandeland_voter_id");
};

// Check if user is admin
export const checkIsAdmin = async (userId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();

  return !error && !!data;
};
