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
          '1, ĐỒNG THỊ THOA  35 tuổi, Trung Tâm, Xã Hợp Thịnh,\nCĐ: U tân sinh không chắc chắn hoặc không biết tính chất của Tuyến giáp\nChuyển Bệnh viện Nội tiết Trung ương cơ sở 2',
      },
      {
        id: 'item-2',
        content:
          '2, NGUYỄN ĐỨC THỊNH  48 tuổi , Trung Tâm, Xã Hợp Thịnh,\nCĐ: Ung thư phổi\nChuyển Bệnh viện K - cơ sở 3',
      },
    ],
  },
  {
    id: 'slide-freetext-2',
    title: 'V. BỆNH NHÂN CHUYỂN VIỆN NGOÀI GIỜ',
    items: [
      {
        id: 'item-2-1',
        content:
          '1, BỆNH NHÂN ... tuổi, Địa chỉ: ...\nCĐ: ...\nChuyển Bệnh viện ...',
      },
    ],
  },
  {
    id: 'slide-freetext-3',
    title: 'VI. BỆNH NHÂN CHUYỂN VIỆN NỘI TRÚ',
    items: [
      {
        id: 'item-3-1',
        content:
          '1, BỆNH NHÂN ... tuổi, Khoa: ...\nCĐ: ...\nChuyển Bệnh viện ...',
      },
    ],
  },
];
