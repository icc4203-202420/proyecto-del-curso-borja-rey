# app/controllers/api/v1/reviews_controller.rb
class API::V1::ReviewsController < ApplicationController
  respond_to :json
  before_action :set_beer, only: [:create]
  before_action :set_user, only: [:index, :create]
  before_action :set_review, only: [:show, :update, :destroy]

  def index
    @reviews_user = Review.where(user: @user)
    render json: { reviews_user: @reviews_user }, status: :ok
  end

  def show
    if @review
      render json: { review: @review }, status: :ok
    else
      render json: { error: "Review not found" }, status: :not_found
    end
  end

  def create
    @review = @user.reviews.new(review_params)
    @user_review = Review.where(user: @user, beer: @beer)
    if @user_review.exists?
      render json: { error: "User already reviewed this beer" }, status: :unprocessable_entity
    else
      if @review.save
        # Broadcast the new review to the feed channel
        ActionCable.server.broadcast 'feed_channel', review: @review.as_json(include: [:user, :beer, :bar]).merge(user_handle: @review.user.handle, beer_name: @review.beer.name, bar_name: @review.bar.name)
        render json: @review, status: :created, location: api_v1_review_url(@review)
      else
        render json: @review.errors, status: :unprocessable_entity
      end
    end
  end

  def update
    if @review.update(review_params)
      render json: @review, status: :ok
    else
      render json: @review.errors, status: :unprocessable_entity
    end
  end

  def destroy
    @review.destroy
    head :no_content
  end

  private

  def set_review
    @review = Review.find_by(id: params[:id])
    render json: { error: "Review not found" }, status: :not_found unless @review
  end

  def set_user
    @user = User.find(params[:review][:user_id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "User not found" }, status: :not_found
  end

  def set_beer
    @beer = Beer.find(params[:review][:beer_id])
  end

  def review_params
    params.require(:review).permit(:id, :text, :rating, :beer_id, :user_id)
  end
end
