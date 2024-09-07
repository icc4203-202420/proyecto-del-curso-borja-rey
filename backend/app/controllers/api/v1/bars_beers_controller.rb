class API::V1::BarsBeersController < ApplicationController
  include Authenticable

  respond_to :json
  before_action :set_bars_beer, only: [:show, :update, :destroy]
  before_action :verify_jwt_token, only: [:create, :update, :destroy]

  def index
    @bars_beers = BarsBeer.all
    render json: { bars_beers: @bars_beers }, status: :ok
  end

  def show
      render json: { bars_beer: @bars_beer.as_json }, status: :ok
  end

  def create
    @bars_beer = BarsBeer.new(bars_beer_params)

    if @bars_beer.save
      render json: { bars_beer: @bars_beer, message: 'bars_beer created successfully.' }, status: :ok
    else
      render json: @bars_beer.errors, status: :unprocessable_entity
    end
  end

  def update
    if @bars_beer.update(bars_beer_params)
      render json: { bars_beer: @bars_beer, message: 'bars_beer updated successfully.' }, status: :ok
    else
      render json: @bars_beer.errors, status: :unprocessable_entity
    end
  end

  def destroy
    if @bars_beer.destroy
      render json: { message: 'bars_beer successfully deleted.' }, status: :no_content
    else
      render json: @bars_beer.errors, status: :unprocessable_entity
    end
  end

  private

  def set_bars_beer
    @bars_beer = BarsBeer.find_by(id: params[:id])
    render json: { error: 'bars_beer not found' }, status: :not_found unless @bars_beer
  end

  def bars_beer_params
    params.require(:bars_beer).permit(:bar_id, :beer_id)
  end
end
