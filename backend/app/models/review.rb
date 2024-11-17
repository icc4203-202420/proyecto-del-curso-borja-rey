class Review < ApplicationRecord
  belongs_to :user
  belongs_to :beer

  after_save :update_beer_rating
  after_destroy :update_beer_rating

  private

  def update_beer_rating
    puts "avg rating b: #{beer.avg_rating}"
    puts "Updating beer rating"
    beer.update_avg_rating
    puts "avg rating a: #{beer.avg_rating}"
  end
end