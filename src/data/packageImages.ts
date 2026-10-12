const photo = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=85`;

const galleries: Record<string, string[]> = {
  manali: ['photo-1626621341517-bbf3d9990a23', 'photo-1464822759023-fed622ff2c3b', 'photo-1501785888041-af3ef285b470', 'photo-1519681393784-d120267933ba', 'photo-1470770841072-f978cf4d019e'],
  goa: ['photo-1512343879784-a960bf40e7f2', 'photo-1507525428034-b723cf961d3e', 'photo-1519046904884-53103b34b206', 'photo-1500375592092-40eb2168fd21', 'photo-1493558103817-58b2924bce98'],
  kashmir: ['photo-1595815771614-ade9d652a65d', 'photo-1519681393784-d120267933ba', 'photo-1464822759023-fed622ff2c3b', 'photo-1501785888041-af3ef285b470', 'photo-1470770841072-f978cf4d019e'],
  dubai: ['photo-1512453979798-5ea266f8880c', 'photo-1589287045688-5ace6419b16e', 'photo-1519501025264-65ba15a82390', 'photo-1480714378408-67cf0d13bc1b', 'photo-1512632578888-169bbbc64f33'],
  india: ['photo-1500534623283-312aade485b7', 'photo-1598091383021-15ddea10925d', 'photo-1524492412937-b28074a5d7da', 'photo-1599661046827-dacff0c0f09a', 'photo-1587474260584-136574528ed5'],
  swiss: ['photo-1530789253388-582c481c54b0', 'photo-1501785888041-af3ef285b470', 'photo-1464822759023-fed622ff2c3b', 'photo-1519681393784-d120267933ba', 'photo-1500534623283-312aade485b7'],
  kerala: ['photo-1602216056096-3b40cc0c9944', 'photo-1540541338287-41700207dee6', 'photo-1484291470158-b8f8d608850d', 'photo-1500375592092-40eb2168fd21', 'photo-1520250497591-112f2f40a3f4'],
  maldives: ['photo-1514282401047-d79a71a590e8', 'photo-1520250497591-112f2f40a3f4', 'photo-1540541338287-41700207dee6', 'photo-1507525428034-b723cf961d3e', 'photo-1519046904884-53103b34b206'],
  japan: ['photo-1493976040374-85c8e12f0c0e', 'photo-1540959733332-eab4deabeeaf', 'photo-1528360983277-13d401cdc186', 'photo-1513407030348-c983a97b98d8', 'photo-1522383225653-ed111181a951'],
  delhi: ['photo-1587474260584-136574528ed5', 'photo-1564507592333-c60657eea523', 'photo-1524492412937-b28074a5d7da', 'photo-1599661046827-dacff0c0f09a', 'photo-1519501025264-65ba15a82390'],
};

const defaultGallery = ['photo-1500530855697-b586d89ba3ee', 'photo-1500534623283-312aade485b7', 'photo-1526772662000-3f88f10405ff', 'photo-1476514525535-07fb3b4ae5f1', 'photo-1501785888041-af3ef285b470'];

export function getPackageGallery(id: string, title: string, destination: string | undefined, cover: string, savedGallery?: string[]): string[] {
  const identity = `${id} ${title} ${destination ?? ''}`.toLowerCase();
  const key = ['manali', 'goa', 'kashmir', 'dubai', 'punjab', 'amritsar', 'swiss', 'kerala', 'maldives', 'japan', 'delhi'].find((name) => identity.includes(name));
  const fallback = galleries[key === 'punjab' || key === 'amritsar' ? 'india' : key ?? ''] ?? defaultGallery;
  const images = [...(savedGallery ?? []), cover, ...fallback.map(photo)].filter(Boolean);
  return [...new Set(images)].slice(0, 5);
}
