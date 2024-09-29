class API::V1::TagsController < ApplicationController
  def new
    @tag = Tag.new
  end

  def create
    @tag = Tag.new(tag_params)

    if @tag.save
      render json: { tag: @tag, message: 'Tag created successfully.' }, status: :ok
    else
      render json: @tag.errors, status: :unprocessable_entity
    end
  end

  private
    def tag_params
      params.require(:tag).permit(:event_picture_id, :tagged_user_id, :tagged_by_id)
    end
end