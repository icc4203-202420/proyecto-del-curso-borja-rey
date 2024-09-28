class EventPicture < ApplicationRecord
  belongs_to :event
  belongs_to :user

  has_one_attached :picture

  def thumbnail
    picture.variant(resize_to_limit: [200, nil]).processed
  end
end
