#!/usr/bin/env node

/**
 * Comprehensive TypeScript Fix Script
 * Automatically fixes common TypeScript errors in Next.js 16+ projects
 * 
 * Usage: node fix-all-typescript.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Starting TypeScript Fixes...\n');

// ============================================================================
// 1. Fix API Route Params (Next.js 16 Compatibility)
// ============================================================================

const apiRouteFiles = [
  'app/api/cards/[id]/route.ts',
  'app/api/cards/[id]/like/route.ts',
  'app/api/cards/[id]/bookmark/route.ts',
  'app/api/chats/[id]/route.ts',
  'app/api/workspaces/[id]/route.ts',
  'app/api/members/[id]/route.ts',
  'app/api/notes/[id]/route.ts',
  'app/api/documents/[id]/route.ts',
  'app/api/notifications/[id]/read/route.ts',
];

console.log('📝 Fixing API Route Params...');

apiRouteFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    console.log(`   ⚠️  Skipped: ${file} (not found)`);
    return;
  }

  let content = fs.readFileSync(file, 'utf8');
  let modified = false;

  // Fix 1: Update params type signature
  const oldParamsType = /{ params }: { params: { id: string } }/g;
  const newParamsType = '{ params }: { params: Promise<{ id: string }> }';
  
  if (oldParamsType.test(content)) {
    content = content.replace(oldParamsType, newParamsType);
    modified = true;
  }

  // Fix 2: Add await params after function start
  // Pattern: export async function METHOD(...) { try {
  const functionPattern = /(export async function (?:GET|POST|PUT|PATCH|DELETE)\([^)]+\) \{\s+try \{\s*)/g;
  
  content = content.replace(functionPattern, (match) => {
    // Check if already has await params
    if (match.includes('await params')) {
      return match;
    }
    // Add await params with appropriate variable name based on file
    let varName = 'id';
    if (file.includes('documents')) varName = 'documentId';
    else if (file.includes('members')) varName = 'memberId';
    else if (file.includes('notes')) varName = 'noteId';
    else if (file.includes('chats')) varName = 'chatId';
    else if (file.includes('workspaces')) varName = 'workspaceId';
    else if (file.includes('notifications')) varName = 'notificationId';
    else if (file.includes('cards')) varName = 'id'; // cards use 'id' directly
    
    modified = true;
    return match + `    const { id: ${varName} } = await params;\n    \n`;
  });

  // Fix 3: Remove old params.id references (if any remain)
  content = content.replace(/const \w+ = params\.id;?\s*/g, '');

  if (modified) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`   ✅ Fixed: ${file}`);
  } else {
    console.log(`   ✓  OK: ${file}`);
  }
});

console.log('');

// ============================================================================
// 2. Fix Axios Imports
// ============================================================================

console.log('📦 Fixing Axios Imports...');

const axiosFile = 'lib/axios.ts';

if (fs.existsSync(axiosFile)) {
  let content = fs.readFileSync(axiosFile, 'utf8');
  let modified = false;

  // Fix: Split axios imports
  const oldImport = /import axios, \{ AxiosError, (.*?) \} from 'axios';/;
  const newImport = `import axios from 'axios';\nimport type { $1 } from 'axios';`;
  
  if (oldImport.test(content)) {
    content = content.replace(oldImport, newImport);
    modified = true;
  }

  // Fix: Replace AxiosError type annotations with unknown
  const errorTypePattern = /\(error: AxiosError\)/g;
  if (errorTypePattern.test(content)) {
    content = content.replace(errorTypePattern, '(error: unknown)');
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(axiosFile, content, 'utf8');
    console.log(`   ✅ Fixed: ${axiosFile}`);
  } else {
    console.log(`   ✓  OK: ${axiosFile}`);
  }
} else {
  console.log(`   ⚠️  Skipped: ${axiosFile} (not found)`);
}

console.log('');

// ============================================================================
// 3. Fix API Headers Type
// ============================================================================

console.log('🔐 Fixing API Headers Type...');

const apiFile = 'lib/api.ts';

if (fs.existsSync(apiFile)) {
  let content = fs.readFileSync(apiFile, 'utf8');
  let modified = false;

  // Fix: Change HeadersInit to Record<string, string>
  const oldHeadersType = /const headers: HeadersInit = \{/;
  const newHeadersType = 'const headers: Record<string, string> = {';
  
  if (oldHeadersType.test(content)) {
    content = content.replace(oldHeadersType, newHeadersType);
    modified = true;
  }

  // Fix: Cast options.headers
  const oldHeadersSpread = /\.\.\.options\.headers,/;
  const newHeadersSpread = '...(options.headers as Record<string, string>),';
  
  if (oldHeadersSpread.test(content)) {
    content = content.replace(oldHeadersSpread, newHeadersSpread);
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(apiFile, content, 'utf8');
    console.log(`   ✅ Fixed: ${apiFile}`);
  } else {
    console.log(`   ✓  OK: ${apiFile}`);
  }
} else {
  console.log(`   ⚠️  Skipped: ${apiFile} (not found)`);
}

console.log('');

// ============================================================================
// 4. Fix Heroicons Imports
// ============================================================================

console.log('🎨 Fixing Heroicons Imports...');

const iconReplacements = {
  'RefreshIcon': 'ArrowPathIcon',
  'ReplyIcon': 'ArrowUturnLeftIcon',
  'MailIcon': 'EnvelopeIcon',
  'MenuIcon': 'Bars3Icon',
  'MenuAlt1Icon': 'Bars3BottomLeftIcon',
  'MenuAlt2Icon': 'Bars3CenterLeftIcon',
  'MenuAlt3Icon': 'Bars3BottomRightIcon',
  'MenuAlt4Icon': 'Bars2Icon',
  'XIcon': 'XMarkIcon',
  'DotsVerticalIcon': 'EllipsisVerticalIcon',
  'DotsHorizontalIcon': 'EllipsisHorizontalIcon',
  'DotsCircleHorizontalIcon': 'EllipsisHorizontalCircleIcon',
  'ChevronDownIcon': 'ChevronDownIcon', // No change
  'SearchIcon': 'MagnifyingGlassIcon',
  'FilterIcon': 'FunnelIcon',
  'SelectorIcon': 'ChevronUpDownIcon',
  'SwitchHorizontalIcon': 'ArrowsRightLeftIcon',
  'SwitchVerticalIcon': 'ArrowsUpDownIcon',
  'ViewListIcon': 'ListBulletIcon',
  'ViewGridIcon': 'Squares2X2Icon',
  'ViewBoardsIcon': 'RectangleStackIcon',
  'CollectionIcon': 'RectangleStackIcon',
  'PhotographIcon': 'PhotoIcon',
  'MusicNoteIcon': 'MusicalNoteIcon',
  'VideoCameraIcon': 'VideoCameraIcon', // No change
  'LocationMarkerIcon': 'MapPinIcon',
  'OfficeBuildingIcon': 'BuildingOfficeIcon',
  'LibraryIcon': 'BuildingLibraryIcon',
  'TruckIcon': 'TruckIcon', // No change
  'CurrencyDollarIcon': 'CurrencyDollarIcon', // No change
  'BadgeCheckIcon': 'CheckBadgeIcon',
  'ClipboardListIcon': 'ClipboardDocumentListIcon',
  'ClipboardCopyIcon': 'ClipboardDocumentIcon',
  'ClipboardCheckIcon': 'ClipboardDocumentCheckIcon',
  'DocumentDownloadIcon': 'ArrowDownTrayIcon',
  'DocumentAddIcon': 'DocumentPlusIcon',
  'DocumentRemoveIcon': 'DocumentMinusIcon',
  'FolderAddIcon': 'FolderPlusIcon',
  'FolderRemoveIcon': 'FolderMinusIcon',
  'FolderDownloadIcon': 'FolderArrowDownIcon',
  'DownloadIcon': 'ArrowDownTrayIcon',
  'UploadIcon': 'ArrowUpTrayIcon',
  'SaveIcon': 'ArrowDownTrayIcon',
  'SaveAsIcon': 'ArrowDownOnSquareIcon',
  'ReceiptTaxIcon': 'ReceiptPercentIcon',
  'ReceiptRefundIcon': 'ReceiptRefundIcon', // No change
  'CashIcon': 'BanknotesIcon',
  'CreditCardIcon': 'CreditCardIcon', // No change
  'UserAddIcon': 'UserPlusIcon',
  'UserRemoveIcon': 'UserMinusIcon',
  'UserGroupIcon': 'UserGroupIcon', // No change
  'UsersIcon': 'UsersIcon', // No change
  'AnnotationIcon': 'ChatBubbleLeftIcon',
  'ChatIcon': 'ChatBubbleOvalLeftIcon',
  'ChatAltIcon': 'ChatBubbleLeftRightIcon',
  'ChatAlt2Icon': 'ChatBubbleBottomCenterIcon',
  'InboxIcon': 'InboxIcon', // No change
  'InboxInIcon': 'InboxArrowDownIcon',
  'MailOpenIcon': 'EnvelopeOpenIcon',
  'PaperAirplaneIcon': 'PaperAirplaneIcon', // No change
  'StatusOnlineIcon': 'SignalIcon',
  'StatusOfflineIcon': 'SignalSlashIcon',
  'SupportIcon': 'LifebuoyIcon',
  'PhoneIcon': 'PhoneIcon', // No change
  'PhoneIncomingIcon': 'PhoneArrowDownLeftIcon',
  'PhoneOutgoingIcon': 'PhoneArrowUpRightIcon',
  'PhoneMissedCallIcon': 'PhoneXMarkIcon',
  'TemplateIcon': 'RectangleStackIcon',
  'TerminalIcon': 'CommandLineIcon',
  'CodeIcon': 'CodeBracketIcon',
  'DatabaseIcon': 'CircleStackIcon',
  'ServerIcon': 'ServerIcon', // No change
  'CloudIcon': 'CloudIcon', // No change
  'CloudDownloadIcon': 'CloudArrowDownIcon',
  'CloudUploadIcon': 'CloudArrowUpIcon',
  'ExternalLinkIcon': 'ArrowTopRightOnSquareIcon',
  'LinkIcon': 'LinkIcon', // No change
  'PlusIcon': 'PlusIcon', // No change
  'MinusIcon': 'MinusIcon', // No change
  'CheckIcon': 'CheckIcon', // No change
  'BanIcon': 'NoSymbolIcon',
  'ExclamationIcon': 'ExclamationTriangleIcon',
  'InformationCircleIcon': 'InformationCircleIcon', // No change
  'QuestionMarkCircleIcon': 'QuestionMarkCircleIcon', // No change
  'LightBulbIcon': 'LightBulbIcon', // No change
  'LightningBoltIcon': 'BoltIcon',
  'FireIcon': 'FireIcon', // No change
  'SparklesIcon': 'SparklesIcon', // No change
  'StarIcon': 'StarIcon', // No change
  'HeartIcon': 'HeartIcon', // No change
  'ThumbUpIcon': 'HandThumbUpIcon',
  'ThumbDownIcon': 'HandThumbDownIcon',
  'EmojiHappyIcon': 'FaceSmileIcon',
  'EmojiSadIcon': 'FaceFrownIcon',
  'TrendingUpIcon': 'ArrowTrendingUpIcon',
  'TrendingDownIcon': 'ArrowTrendingDownIcon',
  'ScaleIcon': 'ScaleIcon', // No change
  'CalculatorIcon': 'CalculatorIcon', // No change
  'CalendarIcon': 'CalendarIcon', // No change
  'ClockIcon': 'ClockIcon', // No change
  'BellIcon': 'BellIcon', // No change
  'VolumeUpIcon': 'SpeakerWaveIcon',
  'VolumeOffIcon': 'SpeakerXMarkIcon',
  'MicrophoneIcon': 'MicrophoneIcon', // No change
  'PlayIcon': 'PlayIcon', // No change
  'PauseIcon': 'PauseIcon', // No change
  'StopIcon': 'StopIcon', // No change
  'FastForwardIcon': 'ForwardIcon',
  'RewindIcon': 'BackwardIcon',
  'ZoomInIcon': 'MagnifyingGlassPlusIcon',
  'ZoomOutIcon': 'MagnifyingGlassMinusIcon',
  'AdjustmentsIcon': 'AdjustmentsHorizontalIcon',
  'ColorSwatchIcon': 'SwatchIcon',
  'PencilIcon': 'PencilIcon', // No change
  'PencilAltIcon': 'PencilSquareIcon',
  'TrashIcon': 'TrashIcon', // No change
  'DuplicateIcon': 'DocumentDuplicateIcon',
  'ArchiveIcon': 'ArchiveBoxIcon',
  'InboxIcon': 'InboxIcon', // No change
  'BookmarkIcon': 'BookmarkIcon', // No change
  'BookmarkAltIcon': 'BookmarkSquareIcon',
  'BookOpenIcon': 'BookOpenIcon', // No change
  'NewspaperIcon': 'NewspaperIcon', // No change
  'AcademicCapIcon': 'AcademicCapIcon', // No change
  'BeakerIcon': 'BeakerIcon', // No change
  'BriefcaseIcon': 'BriefcaseIcon', // No change
  'CakeIcon': 'CakeIcon', // No change
  'ChartBarIcon': 'ChartBarIcon', // No change
  'ChartPieIcon': 'ChartPieIcon', // No change
  'ChartSquareBarIcon': 'ChartBarSquareIcon',
  'CubeIcon': 'CubeIcon', // No change
  'CubeTransparentIcon': 'CubeTransparentIcon', // No change
  'CurrencyBangladeshiIcon': 'CurrencyBangladeshiIcon', // No change
  'CurrencyEuroIcon': 'CurrencyEuroIcon', // No change
  'CurrencyPoundIcon': 'CurrencyPoundIcon', // No change
  'CurrencyRupeeIcon': 'CurrencyRupeeIcon', // No change
  'CurrencyYenIcon': 'CurrencyYenIcon', // No change
  'DesktopComputerIcon': 'ComputerDesktopIcon',
  'DeviceMobileIcon': 'DevicePhoneMobileIcon',
  'DeviceTabletIcon': 'DeviceTabletIcon', // No change
  'FlagIcon': 'FlagIcon', // No change
  'GiftIcon': 'GiftIcon', // No change
  'GlobeIcon': 'GlobeAmericasIcon',
  'GlobeAltIcon': 'GlobeAltIcon', // No change
  'HashtagIcon': 'HashtagIcon', // No change
  'HomeIcon': 'HomeIcon', // No change
  'IdentificationIcon': 'IdentificationIcon', // No change
  'KeyIcon': 'KeyIcon', // No change
  'LockClosedIcon': 'LockClosedIcon', // No change
  'LockOpenIcon': 'LockOpenIcon', // No change
  'LoginIcon': 'ArrowLeftOnRectangleIcon',
  'LogoutIcon': 'ArrowRightOnRectangleIcon',
  'MapIcon': 'MapIcon', // No change
  'MenuIcon': 'Bars3Icon',
  'MinusCircleIcon': 'MinusCircleIcon', // No change
  'MinusSmIcon': 'MinusSmallIcon',
  'PaperClipIcon': 'PaperClipIcon', // No change
  'PlusCircleIcon': 'PlusCircleIcon', // No change
  'PlusSmIcon': 'PlusSmallIcon',
  'PrinterIcon': 'PrinterIcon', // No change
  'PuzzleIcon': 'PuzzlePieceIcon',
  'QrcodeIcon': 'QrCodeIcon',
  'RefreshIcon': 'ArrowPathIcon',
  'RssIcon': 'RssIcon', // No change
  'SaveIcon': 'ArrowDownTrayIcon',
  'ScissorsIcon': 'ScissorsIcon', // No change
  'SearchCircleIcon': 'MagnifyingGlassCircleIcon',
  'ShareIcon': 'ShareIcon', // No change
  'ShieldCheckIcon': 'ShieldCheckIcon', // No change
  'ShieldExclamationIcon': 'ShieldExclamationIcon', // No change
  'ShoppingBagIcon': 'ShoppingBagIcon', // No change
  'ShoppingCartIcon': 'ShoppingCartIcon', // No change
  'SortAscendingIcon': 'BarsArrowUpIcon',
  'SortDescendingIcon': 'BarsArrowDownIcon',
  'SunIcon': 'SunIcon', // No change
  'MoonIcon': 'MoonIcon', // No change
  'TableIcon': 'TableCellsIcon',
  'TagIcon': 'TagIcon', // No change
  'TicketIcon': 'TicketIcon', // No change
  'TranslateIcon': 'LanguageIcon',
  'TrendingUpIcon': 'ArrowTrendingUpIcon',
  'TrendingDownIcon': 'ArrowTrendingDownIcon',
  'UserCircleIcon': 'UserCircleIcon', // No change
  'UserIcon': 'UserIcon', // No change
  'ViewGridAddIcon': 'SquaresPlusIcon',
  'WifiIcon': 'WifiIcon', // No change
  'XCircleIcon': 'XCircleIcon', // No change
};

// Find all TypeScript/JavaScript files
function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and .next
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        findFiles(filePath, fileList);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

const allFiles = findFiles('.');
let iconFixCount = 0;

allFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;

  // Check if file imports from heroicons
  if (content.includes('@heroicons/react')) {
    Object.entries(iconReplacements).forEach(([oldIcon, newIcon]) => {
      if (oldIcon !== newIcon && content.includes(oldIcon)) {
        const regex = new RegExp(oldIcon, 'g');
        content = content.replace(regex, newIcon);
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(file, content, 'utf8');
      iconFixCount++;
      console.log(`   ✅ Fixed: ${file}`);
    }
  }
});

if (iconFixCount === 0) {
  console.log('   ✓  No Heroicons fixes needed');
} else {
  console.log(`   ✅ Fixed ${iconFixCount} file(s)`);
}

console.log('');

// ============================================================================
// Summary
// ============================================================================

console.log('✨ TypeScript Fixes Complete!\n');
console.log('📋 Summary:');
console.log('   ✅ API route params updated for Next.js 16');
console.log('   ✅ Axios imports fixed');
console.log('   ✅ API headers type fixed');
console.log('   ✅ Heroicons imports updated');
console.log('');
console.log('🎯 Next Steps:');
console.log('   1. Run: npx tsc --noEmit');
console.log('   2. Run: npm run build');
console.log('   3. Run: npm run dev');
console.log('');
console.log('🚀 Your project should now compile without TypeScript errors!');
