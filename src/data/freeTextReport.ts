export type FreeTextItem = {
  id: string;
  content: string;
};

export type FreeTextSlideData = {
  id: string;
  title: string;
  items: FreeTextItem[];
};

export const defaultFreeTextSlides: FreeTextSlideData[] = [
  {
    id: 'slide-freetext-1',
    title: 'IV. BỆNH NHÂN CHUYỂN VIỆN NGOẠI TRÚ',
    items: [
      {
        id: 'item-1',
        content:
          'ĐỒNG THỊ THOA  35 tuổi, Trung Tâm, Xã Hợp Thịnh,\nCĐ: U tân sinh không chắc chắn hoặc không biết tính chất của Tuyến giáp\nChuyển Bệnh viện Nội tiết Trung ương cơ sở 2',
      },
      {
        id: 'item-2',
        content:
          'NGUYỄN ĐỨC THỊNH  48 tuổi , Trung Tâm, Xã Hợp Thịnh,\nCĐ: Ung thư phổi\nChuyển Bệnh viện K - cơ sở 3',
      },
    ],
  },
];
