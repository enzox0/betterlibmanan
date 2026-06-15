import { FreedomWallSection } from '../components/sections/FreedomWallSection';

export function FreedomWallPage() {
  // flex-1 so the section fills the <main> flex column provided by Layout
  return (
    <div className="flex-1 flex flex-col">
      <FreedomWallSection />
    </div>
  );
}

FreedomWallPage.displayName = 'FreedomWallPage';

export default FreedomWallPage;
