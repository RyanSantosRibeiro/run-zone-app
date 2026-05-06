// Helper function to get following user IDs
export async function getFollowingIds(
  supabase: any,
  userId: string
): Promise<string> {
  const { data: following } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", userId);

  if (!following || following.length === 0) {
    return "";
  }

  return following.map((f: any) => f.following_id).join(",");
}