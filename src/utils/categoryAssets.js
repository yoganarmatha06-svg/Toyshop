import buildingBlocksImg from '../assets/bulidingblocks.jpg';
import babyToyImg from '../assets/babytoy.jpg';
import boardGamesImg from '../assets/boared toys.jpg';
import carsAndVehiclesImg from '../assets/car and vechile.jpg';
import dollImg from '../assets/doll.jpg';
import remoteControlImg from '../assets/remote.jpg';
import outdoorImg from '../assets/outer copy.jpg';
import puzzleGameImg from '../assets/puzzle game.png';

/**
 * Returns the exact image asset and display configuration for a given category.
 * Matches by category name or slug to ensure identical visual display between
 * the website's Explore 10 Toy Categories and the Admin Categories panel.
 */
export const getCategoryImage = (category) => {
  if (!category) return null;

  const name = (category.name || '').toLowerCase();
  const slug = (category.slug || '').toLowerCase();

  // 1. Building Blocks
  if (name.includes('building') || name.includes('block') || slug === 'building-blocks') {
    return {
      src: buildingBlocksImg,
      alt: category.name || 'Building Blocks',
      fit: 'contain',
      padding: 'p-1',
    };
  }

  // 2. Baby Toys
  if (name.includes('baby') || slug === 'baby-toys') {
    return {
      src: babyToyImg,
      alt: category.name || 'Baby Toys',
      fit: 'cover',
      padding: 'p-0',
    };
  }

  // 3. Board Games
  if (name.includes('board') || slug === 'board-games') {
    return {
      src: boardGamesImg,
      alt: category.name || 'Board Games',
      fit: 'cover',
      padding: 'p-0',
    };
  }

  // 4. Cars and Vehicles
  if (
    slug === 'cars-and-vehicles' ||
    name.includes('vehicle') ||
    name.includes('vechile') ||
    (name.includes('car') && !name.includes('remote') && !name.includes('control'))
  ) {
    return {
      src: carsAndVehiclesImg,
      alt: category.name || 'Cars and Vehicles',
      fit: 'cover',
      padding: 'p-0',
    };
  }

  // 5. Dolls
  if (name.includes('doll') || slug === 'dolls') {
    return {
      src: dollImg,
      alt: category.name || 'Dolls',
      fit: 'contain',
      padding: 'p-1',
    };
  }

  // 6. Remote Control Toys
  if (
    slug === 'remote-control-toys' ||
    name.includes('remote') ||
    name.includes('rc') ||
    name.includes('control car')
  ) {
    return {
      src: remoteControlImg,
      alt: category.name || 'Remote Control Toys',
      fit: 'contain',
      padding: 'p-1',
    };
  }

  // 7. Outdoor Toys (Outer toys)
  if (
    name.includes('outdoor') ||
    name.includes('outer') ||
    slug.includes('outdoor') ||
    slug.includes('outer')
  ) {
    return {
      src: outdoorImg,
      alt: category.name || 'Outdoor Toys',
      fit: 'cover',
      padding: 'p-0',
    };
  }

  // 8. Puzzle Games
  if (name.includes('puzzle') || slug.includes('puzzle')) {
    return {
      src: puzzleGameImg,
      alt: category.name || 'Puzzle Games',
      fit: 'contain',
      padding: 'p-1',
    };
  }

  // Fallback to URL in category.image if valid external image
  if (category.image && typeof category.image === 'string' && category.image.startsWith('http')) {
    return {
      src: category.image,
      alt: category.name || 'Category',
      fit: 'cover',
      padding: 'p-0',
    };
  }

  return null;
};

