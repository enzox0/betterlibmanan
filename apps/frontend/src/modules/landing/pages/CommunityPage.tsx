import { CommunitySection } from "../components/sections/CommunitySection";

export function CommunityPage() {
  return (
    <div className="flex-1 flex flex-col">
      <CommunitySection />
    </div>
  );
}

CommunityPage.displayName = "CommunityPage";

export default CommunityPage;
